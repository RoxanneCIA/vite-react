import React, { forwardRef } from 'react';
import type { InputProps } from 'antd';
import { Input } from 'antd';

const TrimInput = forwardRef<Input, InputProps>(({ onBlur, onChange, ...rest }, ref) => {
  const handleBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    e.target.value = e.target.value.trim();
    onChange?.(e);
  };
  return <Input {...rest} ref={ref} onBlur={handleBlur} onChange={onChange} />;
});

export default TrimInput;
