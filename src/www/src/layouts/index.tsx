import React, { FunctionComponent } from "react";

import Header from '@app/components/header';

interface Props {
  children?: any;
}

const Index: FunctionComponent = ({ children }: Props) => {
  return (
    <>
      <Header />

      <div className="page">
        <div className="page__content">
          {children}
        </div>
      </div>
    </>
  );
};

export default Index;
