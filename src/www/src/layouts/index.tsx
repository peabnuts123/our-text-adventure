import React, { FunctionComponent } from "react";

import Header from '@app/components/header';

interface Props {
  children?: any;
}

const Index: FunctionComponent = ({ children }: Props) => {
  return (
    <>
      <Header />

      <div className="container page">
        {children}
      </div>
    </>
  );
};

export default Index;
