import { Theme } from "@/themes";
import { createText } from "@shopify/restyle";
import { useFontStore } from "@/store/font-store";
import React from "react";

const BaseText = createText<Theme>();

const Text = (props: React.ComponentProps<typeof BaseText>) => {
  const { currentFontId } = useFontStore();
  
  return (
    <BaseText
      {...props}
      style={[
        currentFontId !== "system" ? { fontFamily: currentFontId } : undefined,
        props.style,
      ]}
    />
  );
};

export default Text;
