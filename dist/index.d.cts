type Template = Iterable<string | Promise<Template>>;
declare function html(parts: TemplateStringsArray, ...values: any[]): Template;
interface Writable {
    write(part: string): void;
}
declare function render(writer: Writable, template: Template): Promise<void>;
declare class Suspense {
    constructor(fallback: Template, asyncTemplate: Promise<Template>);
    fallback: Template;
    asyncTemplate: Promise<Template>;
}
declare function suspense(fallback: Template, asyncTemplate: Promise<Template>): Suspense;

export { type Template, type Writable, html, render, suspense };
