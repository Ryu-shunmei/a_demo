"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Input,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  CheckboxGroup,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

import myAxios from "@/utils/my-axios";
import { Fragment, use, useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useBoolean } from "@/hooks/use-boolean";

export default function SiderUsersConf({
  org_id,
  org_name,
  fetchOrgs_,
  setShowRowsData,
  showRowsData,
}) {
  const [outOrgUsers, setOutOrgUsers] = useState([]);
  const [inOrgUsers, setInOrgUsers] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const [editOrgID, setEditOrgID] = useState(null);
  const [disabledKeys, setDisabledKeys] = useState([]);

  const newUser = useBoolean();
  const newUserSchema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
  });

  const newUserDefaultValues = {
    name: "",
    email: "",
  };
  const newUserFormik = useFormik({
    initialValues: newUserDefaultValues,
    validationSchema: newUserSchema,
    onSubmit: async (data) => {
      try {
        const response = await myAxios.post("/user", data);
        console.log("new user", response.data);
        await fetchOutOrgUsers();
        newUserFormik.resetForm();
        newUser.onFalse();
      } catch (error) {
        console.log("new user", error);
        alert(error);
      }
    },
  });
  const fetchInOrgUsers = useCallback(async () => {
    if (org_id === "new") {
      return;
    }
    try {
      const res = await myAxios.get(`/org/in/users?org_id=${org_id}`);
      console.log("fetchInOrgUsers", res.data);
      const tempData = [];
      res.data.forEach((item) => {
        const temp1 = [];
        const temp1_ = [];
        const temp2 = [];
        const temp2_ = [];
        const temp3 = [];
        const temp3_ = [];
        const temp4 = [];
        const temp4_ = [];
        item.permissions.forEach((permission) => {
          if (
            ["P001", "P002", "P003", "P004", "P005"].includes(permission.code)
          ) {
            temp1.push(permission);
            temp1_.push(permission.code);
          }
          if (["P006", "P007", "P008", "P015"].includes(permission.code)) {
            temp2.push(permission);
            temp2_.push(permission.code);
          }
          if (["P009", "P010", "P011"].includes(permission.code)) {
            temp3.push(permission);
            temp3_.push(permission.code);
          }
          if (["P012", "P013", "P014"].includes(permission.code)) {
            temp4.push(permission);
            temp4_.push(permission.code);
          }
        });
        tempData.push({
          ...item,
          permissions_case: temp1,
          permissions_user: temp2,
          permissions_org: temp3,
          permissions_bank: temp4,
          permissions_case_: temp1_,
          permissions_user_: temp2_,
          permissions_org_: temp3_,
          permissions_bank_: temp4_,
        });
      });
      setInOrgUsers(tempData);
    } catch (error) {
      console.log("fetchInOrgUsers", error);
      alert(error);
    }
  }, []);

  const fetchOutOrgUsers = useCallback(async () => {
    try {
      const res = await myAxios.get(`/org/out/users?org_id=${org_id}`);
      setOutOrgUsers(res.data);
    } catch (error) {
      console.log("fetchOutOrgUsers", error);
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

  const NewOrgUserSchema = Yup.object().shape({
    id: Yup.string(),
    email: Yup.string(),
    name: Yup.string(),
    role_id: Yup.string(),
    role_type: Yup.string(),
    permissions_case: Yup.array(),
    permissions_user: Yup.array(),
    permissions_org: Yup.array(),
    permissions_bank: Yup.array(),
    permissions_case_: Yup.array(),
    permissions_user_: Yup.array(),
    permissions_org_: Yup.array(),
    permissions_bank_: Yup.array(),
  });

  const newOrgUserDefaultValues = {
    id: "",
    email: "",
    name: "",
    role_id: "",
    role_type: "",
    permissions_case: [],
    permissions_user: [],
    permissions_org: [],
    permissions_bank: [],
    permissions_case_: [],
    permissions_user_: [],
    permissions_org_: [],
    permissions_bank_: [],
  };
  const newOrgUserformik = useFormik({
    initialValues: newOrgUserDefaultValues,
    validationSchema: NewOrgUserSchema,
    onSubmit: async (data) => {
      console.log(data);
      try {
        const permission_codes = [
          ...data.permissions_case_,
          ...data.permissions_user_,
          ...data.permissions_org_,
          ...data.permissions_bank_,
        ];
        if (editOrgID === null || editOrgID === "new") {
          await myAxios.post(`/org/user?org_id=${org_id}`, {
            ...data,
            permission_codes: permission_codes,
          });
          newOrgUserformik.resetForm();
        } else {
          await myAxios.put(`/org/user`, {
            ...data,
            permission_codes: permission_codes,
          });
          newOrgUserformik.resetForm();
        }
        await fetchInOrgUsers();
        setEditOrgID(null);
        const org = await fetchOrgs_(org_id);
        const tempShowRowsData = JSON.parse(JSON.stringify(showRowsData));
        const targetIndex = showRowsData.findIndex(
          (item) => item.id === org_id
        );
        tempShowRowsData[targetIndex] = org;
        setShowRowsData(tempShowRowsData);
      } catch (error) {
        console.log("new user dailog", error);
      }
    },
  });

  const handleInsert = () => {
    const tempInOrgUsers = JSON.parse(JSON.stringify(inOrgUsers));
    tempInOrgUsers.unshift({
      id: "new",
      email: "",
      name: "",
      role_id: "",
      role_type: "",
      permissions_case: [],
      permissions_user: [],
      permissions_org: [],
      permissions_bank: [],
      permissions_case_: [],
      permissions_user_: [],
      permissions_org_: [],
      permissions_bank_: [],
    });
    setInOrgUsers(tempInOrgUsers);
    newOrgUserformik.setFieldValue("id", "");
    newOrgUserformik.setFieldValue("email", "");
    newOrgUserformik.setFieldValue("name", "");
    newOrgUserformik.setFieldValue("role_id", "");
    newOrgUserformik.setFieldValue("role_type", "");
    newOrgUserformik.setFieldValue("permissions_case", []);
    newOrgUserformik.setFieldValue("permissions_user", []);
    newOrgUserformik.setFieldValue("permissions_org", []);
    newOrgUserformik.setFieldValue("permissions_bank", []);
    newOrgUserformik.setFieldValue("permissions_case_", []);
    newOrgUserformik.setFieldValue("permissions_user_", []);
    newOrgUserformik.setFieldValue("permissions_org_", []);
    newOrgUserformik.setFieldValue("permissions_bank_", []);
    setEditOrgID("new");
  };

  const handleUnInsert = () => {
    const tempInOrgUsers = JSON.parse(JSON.stringify(inOrgUsers));
    tempInOrgUsers.shift();
    setInOrgUsers(tempInOrgUsers);
    setEditOrgID(null);
    newOrgUserformik.resetForm(newOrgUserDefaultValues);
  };

  const handleEdit = (user) => {
    newOrgUserformik.setFieldValue("id", user.id);
    newOrgUserformik.setFieldValue("email", user.email);
    newOrgUserformik.setFieldValue("name", user.name);
    newOrgUserformik.setFieldValue("role_id", user.role_id);
    newOrgUserformik.setFieldValue("role_type", user.role_type);
    newOrgUserformik.setFieldValue("permissions_case", user.permissions_case);
    newOrgUserformik.setFieldValue("permissions_user", user.permissions_user);
    newOrgUserformik.setFieldValue("permissions_org", user.permissions_org);
    newOrgUserformik.setFieldValue("permissions_bank", user.permissions_bank);
    newOrgUserformik.setFieldValue("permissions_case_", user.permissions_case_);
    newOrgUserformik.setFieldValue("permissions_user_", user.permissions_user_);
    newOrgUserformik.setFieldValue("permissions_org_", user.permissions_org_);
    newOrgUserformik.setFieldValue("permissions_bank_", user.permissions_bank_);

    setEditOrgID(user.id);
  };

  const handleUnEdit = () => {
    if (editOrgID === null || editOrgID === "new") {
      handleUnInsert();
    } else {
      setEditOrgID(null);
    }
    newOrgUserformik.resetForm(newOrgUserDefaultValues);
  };

  const handleDelete = async (role_id) => {
    try {
      await myAxios.delete(`/org/user?role_id=${role_id}`);
      await fetchInOrgUsers();
    } catch (error) {
      alert(error);
    }
  };

  const open = useBoolean();

  useEffect(() => {
    if (!!editOrgID) {
      const tempDisabledKeys = [];
      inOrgUsers.forEach((item) => {
        if (item.id !== editOrgID) {
          tempDisabledKeys.push(item.id);
        }
      });
      setDisabledKeys(tempDisabledKeys);
    } else {
      setDisabledKeys([]);
    }
  }, [editOrgID]);

  useEffect(() => {
    fetchRoleTypes();
    fetchOutOrgUsers();
    fetchInOrgUsers();
  }, []);

  return (
    <Fragment>
      <div className="w-full h-[48px] flex flex-row justify-start items-center">
        <Button size="sm" color="secondary" onClick={handleInsert}>
          メンバー追加
        </Button>
      </div>
      <Table
        aria-label="org users"
        color="secondary"
        removeWrapper
        disabledKeys={disabledKeys}
      >
        <TableHeader>
          <TableColumn>ユーザー</TableColumn>
          <TableColumn>権限区分</TableColumn>
          <TableColumn>権限明細</TableColumn>
          <TableColumn></TableColumn>
        </TableHeader>
        <TableBody>
          {inOrgUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell width={200}>
                {editOrgID === user.id && editOrgID === "new" ? (
                  <div className="flex flex-row justify-end items-center space-x-2">
                    <Select
                      size="sm"
                      color="secondary"
                      variant="flat"
                      aria-label="users"
                      labelPlacement="outside"
                      className="max-w-xs"
                      name="id"
                      value={newOrgUserformik.values.id}
                      onChange={newOrgUserformik.handleChange}
                      selectedKeys={
                        !!newOrgUserformik.values.id &&
                        newOrgUserformik.values.id !== "new"
                          ? [newOrgUserformik.values.id]
                          : []
                      }
                    >
                      {outOrgUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Popover
                      placement="bottom"
                      showArrow
                      offset={10}
                      isOpen={newUser.value}
                      onOpenChange={newUser.setValue}
                    >
                      <PopoverTrigger>
                        <Button size="sm" color="secondary" isIconOnly>
                          <Icon width={16} icon="bi:person-plus" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px]">
                        <div className="px-1 py-3 space-y-4 w-full">
                          <div className="mt-2 flex flex-col gap-2 w-full">
                            <Input
                              size="sm"
                              isRequired
                              name="name"
                              label="姓名"
                              aria-label="name"
                              classNames={{
                                label: "text-black/50",
                                input: [
                                  "bg-transparent",
                                  "text-black/60",
                                  "placeholder:text-default-700/40",
                                ],
                              }}
                              color="secondary"
                              value={newUserFormik.values.name}
                              onChange={newUserFormik.handleChange}
                            />
                            <Input
                              size="sm"
                              isRequired
                              name="email"
                              label="Eメール"
                              aria-label="email"
                              classNames={{
                                label: "text-black/50",
                                input: [
                                  "bg-transparent",
                                  "text-black/60",
                                  "placeholder:text-default-700/40",
                                ],
                              }}
                              color="secondary"
                              value={newUserFormik.values.email}
                              onChange={newUserFormik.handleChange}
                            />
                          </div>
                          <Button
                            fullWidth
                            size="md"
                            color="secondary"
                            onClick={newUserFormik.handleSubmit}
                          >
                            ユーザー登録
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <div
                    className={
                      disabledKeys?.includes(user.id)
                        ? "text-secondary-200"
                        : "text-secondary-600"
                    }
                  >
                    {user?.name}
                  </div>
                )}
              </TableCell>
              <TableCell width={120}>
                {editOrgID === user.id ? (
                  <Select
                    size="sm"
                    color="secondary"
                    variant="flat"
                    aria-label="role type"
                    labelPlacement="outside"
                    className="max-w-xs"
                    name="role_type"
                    value={newOrgUserformik.values.role_type}
                    onChange={newOrgUserformik.handleChange}
                    selectedKeys={
                      !!newOrgUserformik.values.role_type
                        ? [newOrgUserformik.values.role_type]
                        : []
                    }
                  >
                    {roleTypes.map((role) => (
                      <SelectItem key={role.code} value={role.code}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div
                    className={
                      disabledKeys?.includes(user.id)
                        ? "text-secondary-200"
                        : "text-secondary-600"
                    }
                  >
                    {
                      roleTypes.find((role) => role.code === user.role_type)
                        ?.name
                    }
                  </div>
                )}
              </TableCell>
              <TableCell width={300}>
                {editOrgID === user.id ? (
                  <div className=" max-w-[350px]">
                    <CheckboxGroup
                      size="sm"
                      label="案件管理"
                      orientation="horizontal"
                      color="secondary"
                      classNames={{
                        label: " text-[9px] h-[12px]",
                      }}
                      value={newOrgUserformik.values.permissions_case_}
                      onValueChange={(v) => {
                        console.log(v);
                        newOrgUserformik.setFieldValue("permissions_case_", v);
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
                      value={newOrgUserformik.values.permissions_user_}
                      onValueChange={(v) =>
                        newOrgUserformik.setFieldValue("permissions_user_", v)
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
                      value={newOrgUserformik.values.permissions_org_}
                      onValueChange={(v) =>
                        newOrgUserformik.setFieldValue("permissions_org_", v)
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
                      label="銀行管理"
                      orientation="horizontal"
                      color="secondary"
                      classNames={{
                        label: " text-[9px] h-[12px]",
                      }}
                      value={newOrgUserformik.values.permissions_bank_}
                      onValueChange={(v) =>
                        newOrgUserformik.setFieldValue("permissions_bank_", v)
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
                ) : (
                  <div className=" w-full ">
                    {user?.permissions_case?.length > 0 && (
                      <div>
                        <div className="text-[9px] pl-1">案件管理</div>
                        <div className="w-full flex flex-row flex-wrap justify-start items-start">
                          {user?.permissions_case_.includes("P002") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              追加
                            </Chip>
                          )}
                          {user?.permissions_case_.includes("P003") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              更新
                            </Chip>
                          )}
                          {user?.permissions_case_.includes("P001") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              検索
                            </Chip>
                          )}
                          {user?.permissions_case_.includes("P004") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              インポート
                            </Chip>
                          )}
                          {user?.permissions_case_.includes("P005") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              エクスポート
                            </Chip>
                          )}
                        </div>
                      </div>
                    )}
                    {user?.permissions_user?.length > 0 && (
                      <div>
                        <div className="text-[9px] pl-1">ユーザー管理</div>
                        <div className="w-full flex flex-row flex-wrap justify-start items-start">
                          {user?.permissions_user_.includes("P007") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              追加
                            </Chip>
                          )}
                          {user?.permissions_user_.includes("P008") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              更新
                            </Chip>
                          )}
                          {user?.permissions_user_.includes("P015") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              削除
                            </Chip>
                          )}
                          {user?.permissions_user_.includes("P006") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              検索
                            </Chip>
                          )}
                        </div>
                      </div>
                    )}
                    {user?.permissions_org?.length > 0 && (
                      <div>
                        <div className="text-[9px] pl-1">組織管理</div>
                        <div className="w-full flex flex-row flex-wrap justify-start items-start">
                          {user?.permissions_org_.includes("P010") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              追加
                            </Chip>
                          )}
                          {user?.permissions_org_.includes("P011") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              更新
                            </Chip>
                          )}
                          {user?.permissions_org_.includes("P009") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              検索
                            </Chip>
                          )}
                        </div>
                      </div>
                    )}
                    {user?.permissions_bank?.length > 0 && (
                      <div>
                        <div className="text-[9px] pl-1">銀行管理</div>
                        <div className="w-full flex flex-row flex-wrap justify-start items-start">
                          {user?.permissions_bank_.includes("P013") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              追加
                            </Chip>
                          )}
                          {user?.permissions_bank_.includes("P014") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              更新
                            </Chip>
                          )}
                          {user?.permissions_bank_.includes("P012") && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              className=" h-[12px] px-0 text-[9px] m-[1px]"
                            >
                              検索
                            </Chip>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell width={60}>
                <div className="flex flex-row justify-end items-center space-x-2">
                  {editOrgID === user.id && (
                    <Button
                      size="sm"
                      color="secondary"
                      isIconOnly
                      onClick={handleUnEdit}
                    >
                      <Icon width={16} icon="bi:x-lg" />
                    </Button>
                  )}
                  {editOrgID === user.id && (
                    <Button
                      size="sm"
                      color="secondary"
                      isIconOnly
                      onClick={newOrgUserformik.handleSubmit}
                    >
                      <Icon width={19} icon="bi:check2" />
                    </Button>
                  )}
                  {editOrgID !== user.id && (
                    <Button
                      size="sm"
                      color="secondary"
                      isIconOnly
                      isDisabled={disabledKeys.includes(user.id)}
                      onClick={() => handleEdit(user)}
                    >
                      <Icon width={16} icon="bi:pencil" />
                    </Button>
                  )}
                  {editOrgID !== user.id && (
                    <Button
                      size="sm"
                      color="secondary"
                      isIconOnly
                      isDisabled={disabledKeys.includes(user.id)}
                      onClick={open.onTrue}
                    >
                      <Icon width={19} icon="bi:trash3" />
                    </Button>
                  )}
                  <Modal size="sm" isOpen={open.value} onClose={open.onFalse}>
                    <ModalContent>
                      <ModalHeader className="flex flex-col gap-1">
                        メンバーの削除
                      </ModalHeader>
                      <ModalBody>
                        <p>
                          {`${org_name}から「${user?.name}」を削除しますか？`}
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          onPress={open.onFalse}
                        >
                          いいえ
                        </Button>
                        <Button
                          size="sm"
                          color="secondary"
                          onPress={async () => {
                            await handleDelete(user.role_id);
                            open.onFalse();
                          }}
                        >
                          はい
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
}
