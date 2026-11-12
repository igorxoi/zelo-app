import { Text as RNText, TextProps } from "react-native";

import {
  FontFamily,
  FontSize,
  type FontSizeToken,
  type FontWeight,
  type ThemeColor,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type Props = TextProps & {
  size?: FontSizeToken;
  weight?: FontWeight;
  color?: ThemeColor;
};

export function Text({
  size = "md",
  weight = "regular",
  color = "text",
  style,
  ...rest
}: Props) {
  const colors = useTheme();

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: FontFamily[weight],
          fontSize: FontSize[size],
          color: colors[color],
        },
        style,
      ]}
    />
  );
}
