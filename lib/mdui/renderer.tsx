"use client";

import * as React from "react";
import { Streamdown } from "streamdown";
import { ActionButton } from "@/components/mdui/ActionButton";
import { Card } from "@/components/mdui/Card";
import { DatePicker } from "@/components/mdui/DatePicker";
import { Notice } from "@/components/mdui/Notice";
import { Section } from "@/components/mdui/Section";
import { TextInput } from "@/components/mdui/TextInput";
import { Toggle } from "@/components/mdui/Toggle";
import type { MDUIToken } from "./parse";

export interface MDUIRendererProps {
  tokens: MDUIToken[];
}

export function MDUIRenderer({ tokens }: MDUIRendererProps) {
  return (
    <>
      {tokens.map((token, index) => (
        <TokenRenderer key={index} token={token} />
      ))}
    </>
  );
}

function TokenRenderer({ token }: { token: MDUIToken }) {
  switch (token.type) {
    case "card":
      return (
        <Card
          description={token.props?.description as string}
          icon={token.props?.icon as string}
          status={
            token.props?.status as "default" | "success" | "warning" | "error"
          }
          title={token.props?.title as string}
        >
          {token.children && <MDUIRenderer tokens={token.children} />}
        </Card>
      );

    case "section":
      return (
        <Section title={token.props?.title as string}>
          {token.children && <MDUIRenderer tokens={token.children} />}
        </Section>
      );

    case "notice":
      return (
        <Notice
          title={token.props?.title as string}
          type={token.props?.type as "info" | "warning" | "error"}
        >
          {token.content}
        </Notice>
      );

    case "textinput":
      return (
        <TextInput
          defaultValue={token.props?.defaultValue as string}
          id={token.props?.id as string}
          label={token.props?.label as string}
          placeholder={token.props?.placeholder as string}
        />
      );

    case "datepicker":
      return (
        <DatePicker
          id={token.props?.id as string}
          label={token.props?.label as string}
        />
      );

    case "toggle":
      return (
        <Toggle
          checked={token.props?.checked as boolean}
          id={token.props?.id as string}
          label={token.props?.label as string}
        />
      );

    case "button":
      return (
        <ActionButton
          action={token.props?.action as string}
          label={token.props?.label as string}
          payload={token.props?.payload as Record<string, unknown>}
          variant={
            (token.props?.variant as
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
              | "ghost"
              | "link") || "default"
          }
        />
      );

    case "markdown":
      return <Streamdown>{token.content || ""}</Streamdown>;

    case "text":
    default:
      return <>{token.content}</>;
  }
}
