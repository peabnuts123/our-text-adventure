import React, { FunctionComponent } from "react";

interface Props {
  children?: any;
}

const Index: FunctionComponent = ({ children }: Props) => {
  return (
    <>
      <h1>I am the layout component</h1>

      {children}
    </>
  );
};

export default Index;
