import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { render, fireEvent, screen, wait } from "@testing-library/react";
import { client } from "./ApolloClient";
import { LoginForm } from "./LoginForm";
import { server } from "./mocks/server";
import { graphql } from "msw";

describe("LoginForm", () => {
  it("should allow a user to log in", async () => {
    render(
      <ApolloProvider client={client}>
        <LoginForm />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "johnUser" },
    });
    fireEvent.click(screen.getByText(/submit/i));

    const userId = await screen.findByTestId("userId");
    const firstName = await screen.findByTestId("firstName");
    const lastName = await screen.findByTestId("lastName");

    expect(userId).toHaveTextContent("f79e82e8-c34a-4dc7-a49e-9fadc0979fda");
    expect(firstName).toHaveTextContent("John");
    expect(lastName).toHaveTextContent("Maverick");
  });

  fit("should show an error", async () => {
    server.use(
      graphql.mutation("Login", (req, res, ctx) => {
        return res(ctx.errors([{ message: "Test" }]));
      })
    );

    render(
      <ApolloProvider client={client}>
        <LoginForm />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "johnnyUser" },
    });
    fireEvent.click(screen.getByText(/submit/i));
    await wait();
    await wait();
    screen.debug();
  });

  fit("should allow a user to log in as Johnny2", async () => {
    server.use(
      graphql.mutation("Login", (req, res, ctx) => {
        return res(
          ctx.data({
            user: {
              __typename: "User",
              id: "f79e82e8-c34a-4dc7-a49e-9fadc0979fda",
              firstName: "Johnny2",
              lastName: "Maverick",
            },
          })
        );
      })
    );

    render(
      <ApolloProvider client={client}>
        <LoginForm />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "johnnyUser" },
    });
    fireEvent.click(screen.getByText(/submit/i));

    const userId = await screen.findByTestId("userId");
    const firstName = await screen.findByTestId("firstName");
    const lastName = await screen.findByTestId("lastName");

    expect(userId).toHaveTextContent("f79e82e8-c34a-4dc7-a49e-9fadc0979fda");
    expect(firstName).toHaveTextContent("Johnny2");
    expect(lastName).toHaveTextContent("Maverick");
  });
});
