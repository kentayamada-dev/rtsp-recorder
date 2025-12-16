export const HelloWorld = ({ text }: { text: string }) => {
  console.log("hello world");
  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
};
