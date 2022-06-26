import React from "react";
import Header from "./Header";
import { useTranslation } from "react-i18next";
type EmptyBlockType = {
  type: "city";
};
const labelMap = {
  city: "city:empty_list",
};
const EmptyBlock: React.FC<EmptyBlockType> = ({ type, children }) => {
  const { t } = useTranslation();
  return (
    <>
      <Header variant="h6">{t(labelMap[type])}</Header>
      {children}
    </>
  );
};
export default EmptyBlock;
