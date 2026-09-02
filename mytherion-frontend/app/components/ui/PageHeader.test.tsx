import React from "react";
import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";

describe("PageHeader Component", () => {
  it("renders title and subtitle correctly", () => {
    render(
      <PageHeader
        title="Test Title"
        subtitle="Test subtitle describing the page."
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test subtitle describing the page.")).toBeInTheDocument();
  });

  it("renders children in the right-locked action slot", () => {
    render(
      <PageHeader title="Test Title">
        <button>Action Button</button>
      </PageHeader>
    );

    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });
});
