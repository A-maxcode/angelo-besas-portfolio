import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

const valid = { name: "Ana", email: "ana@example.com", subject: "Hello", message: "Nice portfolio site!" };

describe("contact form validation", () => {
  it("accepts a complete message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(contactSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("rejects messages shorter than 10 characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "short" }).success).toBe(false);
  });

  it("rejects messages longer than 2000 characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(false);
  });
});
