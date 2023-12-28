"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Select,
  SelectItem,
} from "@nextui-org/react";

import myAxios from "@/utils/my-axios";
import { Icon } from "@iconify/react";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Page() {
  const { user } = useAuthContext();
  const [banks, setBanks] = useState([]);
  const [bankTypes, setBankTypes] = useState([]);
  const [editBankID, setEditBankID] = useState(null);
  const [disabledKeys, setDisabledKeys] = useState([]);
  const bankSchema = Yup.object().shape({
    id: Yup.string(),
    name: Yup.string(),
    type: Yup.string(),
  });

  const bankDefaultValues = {
    id: "",
    name: "",
    type: "",
  };
  const bankFormik = useFormik({
    initialValues: bankDefaultValues,
    validationSchema: bankSchema,
    onSubmit: async (data) => {
      try {
        if (editBankID === null || editBankID === "new") {
          await myAxios.post(`/bank`, data);
          bankFormik.resetForm();
        } else {
          await myAxios.put(`/bank`, data);
          bankFormik.resetForm();
        }
        await fetchBanks();
        setEditBankID(null);
      } catch (error) {
        alert(error);
      }
    },
  });
  const fetchBanks = useCallback(async () => {
    try {
      const res = await myAxios.get(`/banks`);
      setBanks(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const fetchBankTypes = useCallback(async () => {
    try {
      const res = await myAxios.get(`/bank_types`);
      setBankTypes(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const handleInsert = () => {
    const tempBanks = JSON.parse(JSON.stringify(banks));
    tempBanks.unshift({
      id: "new",
      name: "",
      type: "",
    });
    setBanks(tempBanks);
    bankFormik.setFieldValue("id", "");
    bankFormik.setFieldValue("name", "");
    bankFormik.setFieldValue("type", "");
    setEditBankID("new");
  };

  const handleUnInsert = () => {
    const tempBanks = JSON.parse(JSON.stringify(banks));
    tempBanks.shift();
    setBanks(tempBanks);
    setEditBankID(null);
  };

  const handleEdit = (bank) => {
    bankFormik.setFieldValue("id", bank.id);
    bankFormik.setFieldValue("name", bank.name);
    bankFormik.setFieldValue("type", bank.type);
    setEditBankID(bank.id);
  };

  const handleUnEdit = () => {
    if (editBankID === null || editBankID === "new") {
      handleUnInsert();
    } else {
      setEditBankID(null);
    }
    bankFormik.resetForm(bankDefaultValues);
  };

  useEffect(() => {
    if (!!editBankID) {
      const tempDisabledKeys = [];
      banks.forEach((item) => {
        if (item.id !== editBankID) {
          tempDisabledKeys.push(item.id);
        }
      });
      setDisabledKeys(tempDisabledKeys);
    } else {
      setDisabledKeys([]);
    }
  }, [editBankID]);

  useEffect(() => {
    fetchBanks();
    fetchBankTypes();
  }, []);
  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          金融機関管理
        </div>
      </div>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-end items-center">
        <Button
          size="sm"
          color="secondary"
          onClick={handleInsert}
          isDisabled={!user?.permission_codes.includes("P013")}
        >
          金融機関新規
        </Button>
      </div>
      <div className="h-full min-h-[calc(100vh_-_160px)] px-[8px]">
        <Table
          isHeaderSticky
          aria-label="org users"
          color="secondary"
          classNames={{
            wrapper:
              "max-w-[calc(100vw_-_64px)] h-[calc(100vh_-_170px)] max-h-[calc(100vh_-_170px)] p-0 ",
          }}
          disabledKeys={disabledKeys}
        >
          <TableHeader>
            <TableColumn>金融機関名</TableColumn>
            <TableColumn>提携種別</TableColumn>
            <TableColumn></TableColumn>
          </TableHeader>
          <TableBody>
            {user?.permission_codes.includes("P012") &&
              banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell>
                    {editBankID === bank.id ? (
                      <Input
                        className="max-w-xs"
                        aria-label="name"
                        size="sm"
                        labelPlacement="outside"
                        color="secondary"
                        name="name"
                        value={bankFormik.values.name}
                        onChange={bankFormik.handleChange}
                      />
                    ) : (
                      <div
                        className={
                          disabledKeys?.includes(bank.id)
                            ? "text-secondary-200"
                            : "text-secondary-600"
                        }
                      >
                        {bank.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editBankID === bank.id ? (
                      <Select
                        className="max-w-xs"
                        aria-label="type"
                        size="sm"
                        labelPlacement="outside"
                        color="secondary"
                        name="type"
                        onChange={bankFormik.handleChange}
                        selectedKeys={
                          !!bankFormik.values.type
                            ? [bankFormik.values.type]
                            : []
                        }
                      >
                        {bankTypes.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </Select>
                    ) : (
                      <div
                        className={
                          disabledKeys?.includes(bank.id)
                            ? "text-secondary-200"
                            : "text-secondary-600"
                        }
                      >
                        {
                          bankTypes.find((item) => item.code === bank?.type)
                            ?.name
                        }
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row justify-end items-center space-x-2">
                      {editBankID === bank.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          onClick={handleUnEdit}
                        >
                          <Icon width={16} icon="bi:x-lg" />
                        </Button>
                      )}
                      {editBankID === bank.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          onClick={bankFormik.handleSubmit}
                        >
                          <Icon width={19} icon="bi:check2" />
                        </Button>
                      )}
                      {editBankID !== bank.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          isDisabled={
                            disabledKeys.includes(bank.id) ||
                            !user?.permission_codes.includes("P014")
                          }
                          onClick={() => handleEdit(bank)}
                        >
                          <Icon width={16} icon="bi:pencil" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </Fragment>
  );
}
