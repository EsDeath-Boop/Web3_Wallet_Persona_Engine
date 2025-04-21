import { css, cx } from "@/styled-system/css";
import { FC } from "react";

type ProgressProps = {
  value: number;
  color?: string;
  size?: "sm" | "md" | "lg";
};

export const Progress: FC<ProgressProps> = ({ value, color = "green.400", size = "sm" }) => {
  const height = size === "sm" ? "1" : size === "md" ? "2" : "3";

  return (
    <div
      className={cx(
        css({
          w: "100%",
          bg: "gray.200",
          rounded: "full",
          h: height,
          overflow: "hidden",
        })
      )}
    >
      <div
        className={css({
          bg: color,
          w: `${value}%`,
          h: "full",
          transition: "width 0.3s ease",
        })}
      />
    </div>
  );
};
