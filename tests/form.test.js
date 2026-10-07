import {describe, it, expect} from "vitest";
import {screen, within} from "@testing-library/dom";
import {mountPage} from "./helpers/page.js";

describe("early access form", () => {
  it("is a named form landmark", async () => {
    await mountPage();

    // A <form> only gets the "form" role once it has an
    // accessible name, so this query passing proves both.
    const form = screen.getByRole("form", {name: /early access/i});
    expect(form).toBeInTheDocument();
  });

  it("gives every control a programmatically associated label", async () => {
    await mountPage();

    const controls = document.querySelectorAll(
      "input:not([type='hidden']), select, textarea"
    );

    expect(controls.length).toBeGreaterThan(0);

    controls.forEach((control) => {
      // toHaveAccessibleName() with no argument asserts the
      // name is present and not empty — which is only true
      // if a <label>, aria-label or aria-labelledby reaches it.
      expect(
        control,
        `${control.tagName.toLowerCase()}#${control.id || "(no id)"} has no accessible name`
      ).toHaveAccessibleName();
    });
  });

  it("uses input types that give the right mobile keyboard", async () => {
    await mountPage();

    const email = screen.getByLabelText(/email address/i);
    expect(email).toHaveAttribute("type", "email");
    expect(email).toBeRequired();
    expect(email).toHaveAttribute("autocomplete", "email");

    const name = screen.getByLabelText(/full name/i);
    expect(name).toHaveAttribute("autocomplete", "name");
    expect(name).toBeRequired();
  });

  it("attaches hint text with aria-describedby", async () => {
    await mountPage();

    const email = screen.getByLabelText(/email address/i);

    expect(email).toHaveAccessibleDescription(/only use this/i);

    // And the referenced id must actually exist. A dangling
    // aria-describedby fails silently in production.
    email
      .getAttribute("aria-describedby")
      .split(/\s+/)
      .forEach((id) => {
        expect(
          document.getElementById(id),
          `aria-describedby points at #${id}, which does not exist`
        ).not.toBeNull();
      });
  });

  it("groups the radio buttons under a legend", async () => {
    await mountPage();

    const group = screen.getByRole("group", { name: /how often/i });
    const radios = within(group).getAllByRole("radio");

    expect(radios.length).toBeGreaterThanOrEqual(2);

    // One shared name = one group.
    const names = new Set([...radios].map((r) => r.name));
    expect(names.size).toBe(1);

    // Exactly one default, so the group is never in a state
    // the user cannot escape.
    expect(radios.filter((r) => r.defaultChecked)).toHaveLength(1);
  });

  it("offers a real prompt option on the select", async () => {
    await mountPage();

    const select = screen.getByLabelText(/what will you use it for/i);
    expect(select).toBeRequired();

    const options = within(select).getAllByRole("option");
    // The first option must carry an empty value, otherwise
    // `required` is satisfied before the user chooses anything.
    expect(options[0]).toHaveValue("");
    expect(options.length).toBeGreaterThan(2);
  });

  it("has an empty live region ready for status messages", async () => {
    await mountPage();

    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-live", "polite");
    // It must exist and be EMPTY at load. Screen readers announce
    // changes to a live region; inserting the region and its text
    // together often announces nothing.
    expect(status).toBeEmptyDOMElement();
  });

  it("submits with a button of type submit", async () => {
    await mountPage();

    const submit = screen.getByRole("button", { name: /request access/i });

    expect(submit).toHaveAttribute("type", "submit");
    // A disabled submit button cannot be focused, so a keyboard
    // user cannot reach it to discover why it is disabled.
    expect(submit).not.toBeDisabled();
  });

  it("still works without JavaScript", async () => {
    await mountPage();

    const form = screen.getByRole("form", { name: /early access/i });

    // Progressive enhancement: the server endpoint is declared in
    // the markup, so a failed JS bundle degrades instead of dying.
    expect(form).toHaveAttribute("action");
    expect(form.getAttribute("method").toLowerCase()).toBe("post");
  });
});