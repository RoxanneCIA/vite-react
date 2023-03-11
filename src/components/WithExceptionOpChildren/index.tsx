import React from 'react';
import type { FC } from 'react';

import Exception403 from '../Exception/403';
import Exception404 from '../Exception/404';

const WithExceptionOpChildren: FC<{
  currentPathConfig?: { [key: string]: any };
  children?: any;
}> = props => {
  const { children, currentPathConfig } = props;
  if (!currentPathConfig) {
    return <Exception404 />;
  }
  if (currentPathConfig.unaccessible) {
    return <Exception403 />;
  }
  return children;
};

export default WithExceptionOpChildren;
