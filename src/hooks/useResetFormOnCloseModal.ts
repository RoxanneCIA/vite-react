import type { FormInstance } from 'antd';
import { useEffect, useRef } from 'react';

const useResetFormOnCloseModal = ({ form, visible = false }: { form: FormInstance; visible?: boolean }) => {
  const prevVisibleRef = useRef<boolean>();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;

  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible]);
};

export default useResetFormOnCloseModal;
