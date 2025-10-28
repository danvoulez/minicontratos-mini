import { parseMDUI } from "@/lib/mdui/parse";

// Simple test suite for MD-UI parser
console.log("Running MD-UI Parser Tests...\n");

function test(name: string, fn: () => void) {
	try {
		fn();
		console.log(`✅ ${name}`);
	} catch (error) {
		console.error(`❌ ${name}`);
		console.error(error);
	}
}

function assertEqual(actual: unknown, expected: unknown, message?: string) {
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(
			message ||
				`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
		);
	}
}

// Test 1: Parse card syntax
test("should parse card syntax", () => {
	const content = `:::card title="Test Card" icon="📄" status="success"
Content here
:::`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "card");
	assertEqual(tokens[0].props?.title, "Test Card");
	assertEqual(tokens[0].props?.icon, "📄");
	assertEqual(tokens[0].props?.status, "success");
});

// Test 2: Parse toggle syntax
test("should parse toggle syntax", () => {
	const content = `{{toggle id="notify" label="Notificar" checked=true}}`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "toggle");
	assertEqual(tokens[0].props?.id, "notify");
	assertEqual(tokens[0].props?.label, "Notificar");
	assertEqual(tokens[0].props?.checked, true);
});

// Test 3: Parse input syntax
test("should parse input syntax", () => {
	const content = `{{input id="name" label="Nome" placeholder="Digite o nome"}}`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "textinput");
	assertEqual(tokens[0].props?.id, "name");
	assertEqual(tokens[0].props?.label, "Nome");
	assertEqual(tokens[0].props?.placeholder, "Digite o nome");
});

// Test 4: Parse action button syntax
test("should parse action button syntax", () => {
	const content = `[Confirmar](action:confirm {"id": "123"})`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "button");
	assertEqual(tokens[0].props?.label, "Confirmar");
	assertEqual(tokens[0].props?.action, "confirm");
});

// Test 5: Parse notice syntax
test("should parse notice syntax", () => {
	const content = `:::notice type="info" title="Aviso"
Mensagem importante
:::`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "notice");
	assertEqual(tokens[0].props?.type, "info");
	assertEqual(tokens[0].props?.title, "Aviso");
});

// Test 6: Parse section syntax
test("should parse section syntax", () => {
	const content = `:::section title="Detalhes"
**Item 1**: Valor 1
:::`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "section");
	assertEqual(tokens[0].props?.title, "Detalhes");
});

// Test 7: Parse mixed content
test("should parse mixed content", () => {
	const content = `:::card title="Card"
Content
:::
{{toggle id="t1" label="Switch"}}`;
	const tokens = parseMDUI(content);
	if (tokens.length <= 1) {
		throw new Error("Expected multiple tokens");
	}
	const hasCard = tokens.some((t) => t.type === "card");
	const hasToggle = tokens.some((t) => t.type === "toggle");
	if (!hasCard || !hasToggle) {
		throw new Error("Expected both card and toggle tokens");
	}
});

// Test 8: Handle plain markdown without MD-UI
test("should handle plain markdown without MD-UI", () => {
	const content = `# Regular Markdown
This is just regular text.`;
	const tokens = parseMDUI(content);
	assertEqual(tokens.length, 1);
	assertEqual(tokens[0].type, "markdown");
});

console.log("\nAll tests completed!");

