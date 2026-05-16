import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync("docs/contracts/tasiyici-sozlesmesi-v1.md", "utf8");
const wordCount = md.trim().split(/\s+/).length;

const TAG = "$contract_v1$";
if (md.includes(TAG)) {
  throw new Error(
    `Contract content unexpectedly contains the dollar-quote tag ${TAG}`,
  );
}

const escapedSqlString = (s) => s.replace(/'/g, "''");

const sql = `-- Patiyolu — Sprint 5 seed
-- Taşıyıcı Hizmet Sözleşmesi v1.0
-- Otomatik oluşturuldu: scripts/gen-contract-seed.mjs

insert into public.contract_templates (version, audience, title, content_md, word_count)
values (
  'v1.0',
  'transporter',
  '${escapedSqlString("Patiyolu Taşıyıcı Hizmet Sözleşmesi")}',
  ${TAG}${md}${TAG},
  ${wordCount}
)
on conflict (version) do update set
  audience = excluded.audience,
  title = excluded.title,
  content_md = excluded.content_md,
  word_count = excluded.word_count;
`;

writeFileSync("supabase/migrations/0005_seed_contract_v1.sql", sql);
console.log(`word_count: ${wordCount}`);
console.log(`bytes: ${sql.length}`);
