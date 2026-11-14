import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const bash = process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "bash";
const shellPath = (path) => path.replaceAll("\\", "/").replace(/^([A-Z]):/i, (_, drive) => `/${drive.toLowerCase()}`);
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

test("Déploiement : clone indépendant du Git corrompu, protection du site et nettoyage", async () => {
  const workflow = (await readFile(".github/workflows/deploy.yml", "utf8")).replaceAll("\r\n", "\n");
  const script = workflow.split("          script: |\n")[1]?.replace(/^ {12}/gm, "");
  assert.ok(script);
  assert.ok(!script.includes("git pull"));
  const parent = resolve(".astro");
  await mkdir(parent, { recursive: true });
  const fixture = await mkdtemp(resolve(parent, "deploy-test-"));
  try {
    for (const failure of ["none", "clone", "fsck", "build", "audit", "incomplete", "curl", "backup"]) {
      const root = resolve(fixture, failure);
      await mkdir(resolve(root, ".git"), { recursive: true });
      await mkdir(resolve(root, "pb_data"));
      await mkdir(resolve(root, "dist"));
      await writeFile(resolve(root, ".git/corrupt-object"), "keep-corrupt-repo");
      await writeFile(resolve(root, "pb_data/keep"), "keep-database");
      await writeFile(resolve(root, ".env"), "TEST_CONFIG=private\n");
      await writeFile(resolve(root, "dist/index.html"), "old-site");
      if (failure === "backup") {
        await mkdir(resolve(root, ".astro/deploy-previous"), { recursive: true });
        await writeFile(resolve(root, ".astro/deploy-previous/index.html"), "keep-backup");
      }
      // Simulate external services; run the real copy, promotion and rollback commands.
      const harness = `
        git() {
          if [ "$1" = clone ]; then
            [ "$failure" != clone ] || return 1
            local target
            for target in "$@"; do :; done
            mkdir -p "$target/.git"
          elif [ "$1" = -C ] && [ "$3" = fsck ]; then
            [ "$2" != "$deploy_root" ] || return 90
            [ "$failure" != fsck ] || return 1
          else
            return 91
          fi
        }
        bun() {
          case "$*" in
            ci) test "$(cat .env)" = TEST_CONFIG=private ;;
            'run --bun build --outDir .astro/deploy-dist')
              [ "$failure" != build ] || return 1
              mkdir -p .astro/deploy-dist
              [ "$failure" != incomplete ] || return 0
              printf new-site > .astro/deploy-dist/index.html ;;
            'run check:seo .astro/deploy-dist') [ "$failure" != audit ] ;;
            *) return 92 ;;
          esac
        }
        curl() { [ "$failure" != curl ]; }
        failure=${quote(failure)}
        ${script.replace("deploy_root=/var/www/portfolio/Portfolio", `deploy_root=${quote(shellPath(root))}`)}
      `;
      const result = spawnSync(bash, ["-c", harness], { encoding: "utf8", timeout: 20000 });
      assert.ifError(result.error);
      assert.equal(result.status, failure === "none" ? 0 : 1, `${failure}: ${result.stderr}`);
      assert.equal(await readFile(resolve(root, "dist/index.html"), "utf8"), failure === "none" ? "new-site" : "old-site");
      assert.equal(await readFile(resolve(root, ".env"), "utf8"), "TEST_CONFIG=private\n");
      assert.equal(await readFile(resolve(root, "pb_data/keep"), "utf8"), "keep-database");
      assert.equal(await readFile(resolve(root, ".git/corrupt-object"), "utf8"), "keep-corrupt-repo");
      const remaining = await readdir(resolve(root, ".astro"));
      assert.ok(!remaining.some((name) => name.startsWith("deploy-source.")));
      if (failure === "backup") assert.equal(await readFile(resolve(root, ".astro/deploy-previous/index.html"), "utf8"), "keep-backup");
      else assert.ok(!remaining.includes("deploy-previous"));
    }
  } finally {
    assert.ok(fixture.startsWith(parent + sep));
    await rm(fixture, { recursive: true, force: true });
  }
});
