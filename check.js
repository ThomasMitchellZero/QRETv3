// check.js
// managed by AIDA

const fs = require("fs");

function fail(msg) {
  console.error("Rule violation:", msg);
  process.exit(1);
}

const genFile = "generate.cjs";
const text = fs.readFileSync(genFile, "utf8");

// Rule: file must carry managed-by comment
if (!text.includes("// managed by AIDA")) {
  fail("missing // managed by AIDA in generate.cjs");
}

// Rule: must declare workingAgreementRules block
if (!text.includes("const workingAgreementRules")) {
  fail("missing workingAgreementRules block in generate.cjs");
}

// Rule: must declare appRules block
if (!text.includes("const appRules")) {
  fail("missing appRules block in generate.cjs");
}

// Rule: must declare tempRules block
if (!text.includes("const tempRules")) {
  fail("missing tempRules block in generate.cjs");
}

console.log("All checks passed.");
