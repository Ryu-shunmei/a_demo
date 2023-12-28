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
  Chip,
  Checkbox,
  CheckboxGroup,
} from "@nextui-org/react";

import myAxios from "@/utils/my-axios";
import { Icon } from "@iconify/react";
import { jwtDecode } from "jwt-decode";
import { useAuthContext } from "@/hooks/use-auth-context";

export default function Page() {
  const state = useAuthContext();
  const [users, setUsers] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);

  const [accessOrgs, setAccessOrgs] = useState([]);
  const [editUserID, setEditUserID] = useState(null);
  const [disabledKeys, setDisabledKeys] = useState([]);
  const userSchema = Yup.object().shape({
    id: Yup.string(),
    name: Yup.string(),
    email: Yup.string(),
    role_type: Yup.string(),
    org_id: Yup.string(),
    permissions_case_: Yup.array(),
    permissions_user_: Yup.array(),
    permissions_org_: Yup.array(),
    permissions_bank_: Yup.array(),
  });

  const userDefaultValues = {
    id: "",
    name: "",
    email: "",
    role_type: "",
    org_id: "",
    permissions_case_: [],
    permissions_user_: [],
    permissions_org_: [],
    permissions_bank_: [],
  };
  const userFormik = useFormik({
    initialValues: userDefaultValues,
    validationSchema: userSchema,
    onSubmit: async (data) => {
      const permission_codes = [
        ...data.permissions_case_,
        ...data.permissions_user_,
        ...data.permissions_org_,
        ...data.permissions_bank_,
      ];
      try {
        if (editUserID === null || editUserID === "new") {
          await myAxios.post(`/user`, {
            ...data,
            permission_codes: permission_codes,
          });
          userFormik.resetForm();
        } else {
          await myAxios.put(`/user`, {
            ...data,
            permission_codes: permission_codes,
          });
          userFormik.resetForm();
        }
        await fetchUsers();
        setEditUserID(null);
      } catch (error) {
        alert(error);
      }
    },
  });

  const fetchAccessOrgs = useCallback(async () => {
    try {
      const res = await myAxios.get(
        `/options/orgs?role_id=${
          jwtDecode(localStorage.getItem("accessToken", {}))?.default_role_id
        }`
      );
      setAccessOrgs(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await myAxios.get(
        `/users?role_id=${
          jwtDecode(localStorage.getItem("accessToken", {}))?.default_role_id
        }`
      );
      setUsers(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const fetchRoleTypes = useCallback(async () => {
    try {
      const response = await myAxios.get(`/role_types`);
      setRoleTypes(response.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const handleInsert = () => {
    const tempUsers = JSON.parse(JSON.stringify(users));
    tempUsers.unshift({
      id: "new",
      name: "",
      email: "",
      role_type: "",
      org_id: "",
      permissions_case_: [],
      permissions_user_: [],
      permissions_org_: [],
      permissions_bank_: [],
    });
    setUsers(tempUsers);
    userFormik.setFieldValue("id", "");
    userFormik.setFieldValue("name", "");
    userFormik.setFieldValue("email", "");
    userFormik.setFieldValue("role_type", "");
    userFormik.setFieldValue("org_id", "");
    userFormik.setFieldValue("permissions_case_", []);
    userFormik.setFieldValue("permissions_user_", []);
    userFormik.setFieldValue("permissions_org_", []);
    userFormik.setFieldValue("permissions_bank_", []);
    setEditUserID("new");
  };

  const handleUnInsert = () => {
    const tempUsers = JSON.parse(JSON.stringify(users));
    tempUsers.shift();
    setUsers(tempUsers);
    setEditUserID(null);
  };

  const handleEdit = (user) => {
    userFormik.setFieldValue("id", user.id);
    userFormik.setFieldValue("name", user.name);
    userFormik.setFieldValue("email", user.email);
    userFormik.setFieldValue("role_type", "");
    userFormik.setFieldValue("org_id", "");
    userFormik.setFieldValue("permissions_case_", []);
    userFormik.setFieldValue("permissions_user_", []);
    userFormik.setFieldValue("permissions_org_", []);
    userFormik.setFieldValue("permissions_bank_", []);
    setEditUserID(user.id);
  };

  const handleUnEdit = () => {
    if (editUserID === null || editUserID === "new") {
      handleUnInsert();
    } else {
      setEditUserID(null);
    }
    userFormik.resetForm(userDefaultValues);
  };

  useEffect(() => {
    if (!!editUserID) {
      const tempDisabledKeys = [];
      users.forEach((item) => {
        if (item.id !== editUserID) {
          tempDisabledKeys.push(item.id);
        }
      });
      setDisabledKeys(tempDisabledKeys);
    } else {
      setDisabledKeys([]);
    }
  }, [editUserID]);

  useEffect(() => {
    //
    fetchAccessOrgs();
    fetchRoleTypes();
    fetchUsers();
  }, []);
  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          ユーザー管理
        </div>
      </div>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-end items-center">
        <Button
          size="sm"
          color="secondary"
          onClick={handleInsert}
          isDisabled={!state?.user?.permission_codes.includes("P007")}
        >
          ユーザー新規
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
            <TableColumn>ユーザー名</TableColumn>
            <TableColumn>Eメール</TableColumn>
            <TableColumn>所属・ロール</TableColumn>
            <TableColumn>{editUserID === "new" ? "組織" : ""}</TableColumn>
            <TableColumn>{editUserID === "new" ? "権限区分" : ""}</TableColumn>
            <TableColumn>{editUserID === "new" ? "権限詳細" : ""}</TableColumn>
            <TableColumn></TableColumn>
          </TableHeader>
          <TableBody>
            {state?.user?.permission_codes?.includes("P006") &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell width={editUserID === "new" && 130}>
                    {editUserID === user.id ? (
                      <Input
                        className="max-w-xs"
                        aria-label="name"
                        size="sm"
                        labelPlacement="outside"
                        color="secondary"
                        name="name"
                        value={userFormik.values.name}
                        onChange={userFormik.handleChange}
                      />
                    ) : (
                      <div
                        className={
                          disabledKeys?.includes(user.id)
                            ? "text-secondary-200"
                            : "text-secondary-600"
                        }
                      >
                        {user.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell width={editUserID === "new" && 200}>
                    {editUserID === user.id ? (
                      <Input
                        className="max-w-xs"
                        aria-label="name"
                        size="sm"
                        labelPlacement="outside"
                        color="secondary"
                        name="email"
                        value={userFormik.values.email}
                        onChange={userFormik.handleChange}
                      />
                    ) : (
                      <div
                        className={
                          disabledKeys?.includes(user.id)
                            ? "text-secondary-200"
                            : "text-secondary-600"
                        }
                      >
                        {user.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.id === "new" ? (
                      <div className="text-secondary-200">ーー</div>
                    ) : (
                      <div className=" max-w-[30vw] flex flex-row flex-wrap justify-start items-start">
                        {user?.roles?.map((item, index) => (
                          <Chip
                            key={index}
                            variant="flat"
                            color="secondary"
                            isDisabled={
                              disabledKeys.includes(user.id) ||
                              editUserID === user.id
                            }
                            className=" h-[14px] px-0 text-[9px] m-[1px]"
                          >
                            {`${item.org_name}:${
                              roleTypes.find((i) => i.code === item.role_type)
                                ?.name
                            }`}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell width={editUserID === "new" ? 200 : 10}>
                    {"new" === user.id && (
                      <Select
                        className="max-w-xs"
                        aria-label="type"
                        size="sm"
                        labelPlacement="outside"
                        color="secondary"
                        name="org_id"
                        onChange={userFormik.handleChange}
                        selectedKeys={
                          !!userFormik.values.org_id
                            ? [userFormik.values.org_id]
                            : []
                        }
                      >
                        {accessOrgs.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  </TableCell>
                  <TableCell width={editUserID === "new" ? 150 : 10}>
                    {"new" === user.id && (
                      <Select
                        size="sm"
                        color="secondary"
                        variant="flat"
                        aria-label="role type"
                        labelPlacement="outside"
                        className="max-w-xs"
                        name="role_type"
                        value={userFormik.values.role_type}
                        onChange={userFormik.handleChange}
                        selectedKeys={
                          !!userFormik.values.role_type
                            ? [userFormik.values.role_type]
                            : []
                        }
                      >
                        {roleTypes.map((role) => (
                          <SelectItem key={role.code} value={role.code}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  </TableCell>
                  <TableCell width={editUserID === "new" ? 320 : 10}>
                    {"new" === user.id && (
                      <div className=" max-w-[350px]">
                        <CheckboxGroup
                          size="sm"
                          label="案件管理"
                          orientation="horizontal"
                          color="secondary"
                          classNames={{
                            label: " text-[9px] h-[12px]",
                          }}
                          value={userFormik.values.permissions_case_}
                          onValueChange={(v) => {
                            userFormik.setFieldValue("permissions_case_", v);
                          }}
                        >
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P002"
                          >
                            追加
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P003"
                          >
                            更新
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P001"
                          >
                            検索
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P004"
                          >
                            インポート
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P005"
                          >
                            エクスポート
                          </Checkbox>
                        </CheckboxGroup>

                        <CheckboxGroup
                          size="sm"
                          label="ユーザー管理"
                          orientation="horizontal"
                          color="secondary"
                          classNames={{
                            label: " text-[9px] h-[12px]",
                          }}
                          value={userFormik.values.permissions_user_}
                          onValueChange={(v) =>
                            userFormik.setFieldValue("permissions_user_", v)
                          }
                        >
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P007"
                          >
                            追加
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P008"
                          >
                            更新
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P015"
                          >
                            削除
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P006"
                          >
                            検索
                          </Checkbox>
                        </CheckboxGroup>

                        <CheckboxGroup
                          size="sm"
                          label="組織管理"
                          orientation="horizontal"
                          color="secondary"
                          classNames={{
                            label: " text-[9px] h-[12px]",
                          }}
                          value={userFormik.values.permissions_org_}
                          onValueChange={(v) =>
                            userFormik.setFieldValue("permissions_org_", v)
                          }
                        >
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P010"
                          >
                            追加
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P011"
                          >
                            更新
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P009"
                          >
                            検索
                          </Checkbox>
                        </CheckboxGroup>

                        <CheckboxGroup
                          size="sm"
                          label="金融機関管理"
                          orientation="horizontal"
                          color="secondary"
                          classNames={{
                            label: " text-[9px] h-[12px]",
                          }}
                          value={userFormik.values.permissions_bank_}
                          onValueChange={(v) =>
                            userFormik.setFieldValue("permissions_bank_", v)
                          }
                        >
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P013"
                          >
                            追加
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P014"
                          >
                            更新
                          </Checkbox>
                          <Checkbox
                            classNames={{
                              label: "text-[9px]",
                            }}
                            value="P012"
                          >
                            検索
                          </Checkbox>
                        </CheckboxGroup>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row justify-end items-center space-x-2">
                      {editUserID === user.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          onClick={handleUnEdit}
                        >
                          <Icon width={16} icon="bi:x-lg" />
                        </Button>
                      )}
                      {editUserID === user.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          onClick={userFormik.handleSubmit}
                        >
                          <Icon width={19} icon="bi:check2" />
                        </Button>
                      )}
                      {editUserID !== user.id && (
                        <Button
                          size="sm"
                          color="secondary"
                          isIconOnly
                          isDisabled={
                            disabledKeys.includes(user.id) ||
                            !state?.user?.permission_codes?.includes("P008")
                          }
                          onClick={() => handleEdit(user)}
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
