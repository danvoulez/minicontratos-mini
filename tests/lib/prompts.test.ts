// Unit tests for LLM Prompts - Personality and Tool Awareness

import { regularPrompt, systemPrompt } from "../../lib/ai/prompts";

// Simple test runner
const tests: Array<{ name: string; fn: () => void }> = [];
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

function expect(value: any) {
  return {
    toContain(expected: string) {
      if (!String(value).includes(expected)) {
        throw new Error(`Expected value to contain "${expected}"`);
      }
    },
    not: {
      toContain(expected: string) {
        if (String(value).includes(expected)) {
          throw new Error(`Expected value not to contain "${expected}"`);
        }
      },
    },
    toMatch(pattern: RegExp) {
      if (!pattern.test(String(value))) {
        throw new Error(`Expected value to match pattern ${pattern}`);
      }
    },
  };
}

// Test suite
test("regularPrompt emphasizes warm, conversational personality", () => {
  expect(regularPrompt).toContain("assistente entusiasta e acolhedor");
  expect(regularPrompt).toContain("como um colega de trabalho prestativo");
});

test("regularPrompt prohibits technical language", () => {
  expect(regularPrompt).toContain("JAMAIS mencione");
  expect(regularPrompt).toContain("tabelas");
  expect(regularPrompt).toContain("schemas");
  expect(regularPrompt).toContain("IDs");
});

test("regularPrompt provides examples of natural vs technical responses", () => {
  expect(regularPrompt).toContain("❌ NUNCA diga:");
  expect(regularPrompt).toContain("✅ SEMPRE diga:");
  expect(regularPrompt).toContain("ERROR");
  expect(regularPrompt).toContain("Bob que mora em Portugal");
});

test("regularPrompt explains the Universal Registry", () => {
  expect(regularPrompt).toContain("Registro Universal");
  expect(regularPrompt).toContain("QUALQUER informação pode ser salva");
});

test("regularPrompt includes guidance on handling ambiguity", () => {
  expect(regularPrompt).toContain("ambiguidade");
  expect(regularPrompt).toContain("Qual deles você quer dizer");
});

test("regularPrompt emphasizes invisible tool usage", () => {
  expect(regularPrompt).toContain("Suas Ferramentas");
  expect(regularPrompt).toContain("nunca as mencione explicitamente");
  expect(regularPrompt).toContain("use-as de forma invisível");
});

test("regularPrompt includes interaction examples", () => {
  expect(regularPrompt).toContain("Exemplos de Interações");
  expect(regularPrompt).toContain("Adicionar Bob de Lisboa");
  expect(regularPrompt).toContain("Mostrar todos com tag solar");
});

test("regularPrompt emphasizes being a problem solver", () => {
  expect(regularPrompt).toContain("solucionador");
  expect(regularPrompt).toContain("NUNCA diga \"não dá\"");
});

test("systemPrompt includes regular prompt", () => {
  const mockRequestHints = {
    latitude: "40.7128",
    longitude: "-74.0060",
    city: "New York",
    country: "US",
  };
  const prompt = systemPrompt({
    selectedChatModel: "grok-2-1212",
    requestHints: mockRequestHints,
  });
  expect(prompt).toContain("assistente entusiasta");
});

test("systemPrompt includes location hints", () => {
  const mockRequestHints = {
    latitude: "40.7128",
    longitude: "-74.0060",
    city: "New York",
    country: "US",
  };
  const prompt = systemPrompt({
    selectedChatModel: "grok-2-1212",
    requestHints: mockRequestHints,
  });
  expect(prompt).toContain("New York");
  expect(prompt).toContain("40.7128");
});

test("systemPrompt includes artifacts prompt for non-reasoning models", () => {
  const mockRequestHints = {
    latitude: "40.7128",
    longitude: "-74.0060",
    city: "New York",
    country: "US",
  };
  const prompt = systemPrompt({
    selectedChatModel: "grok-2-1212",
    requestHints: mockRequestHints,
  });
  expect(prompt).toContain("Artifacts");
});

test("systemPrompt excludes artifacts prompt for reasoning models", () => {
  const mockRequestHints = {
    latitude: "40.7128",
    longitude: "-74.0060",
    city: "New York",
    country: "US",
  };
  const prompt = systemPrompt({
    selectedChatModel: "chat-model-reasoning",
    requestHints: mockRequestHints,
  });
  expect(prompt).not.toContain("Artifacts");
});

test("regularPrompt has no placeholder text", () => {
  expect(regularPrompt).not.toContain("TODO");
  expect(regularPrompt).not.toContain("FIXME");
  expect(regularPrompt).not.toContain("XXX");
});

test("regularPrompt uses Portuguese Brazilian", () => {
  expect(regularPrompt).toContain("Você");
  expect(regularPrompt).toContain("usuário");
});

test("regularPrompt has clear section headers", () => {
  expect(regularPrompt).toMatch(/##\s+.*Personalidade/);
  expect(regularPrompt).toMatch(/##\s+.*Comunica/);
  expect(regularPrompt).toMatch(/##\s+.*Registro Universal/);
});

// Run tests
console.log("\n🧪 Running LLM Prompts Tests...\n");

for (const t of tests) {
  try {
    t.fn();
    console.log(`✅ ${t.name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ ${t.name}`);
    console.log(`   ${e.message}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${tests.length} total\n`);

if (failed > 0) {
  process.exit(1);
}

