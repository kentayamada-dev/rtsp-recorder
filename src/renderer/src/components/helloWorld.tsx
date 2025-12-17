import { Typography } from "@mui/material";

export const HelloWorld = ({ text }: { text: string }) => {
  console.log("hello world");
  return (
    <div>
      <Typography variant="h1">{text}</Typography>
    </div>
  );
};
