"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Card,
  Checkbox,
  Divider,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

import myAxios from "@/utils/my-axios";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useBoolean } from "@/hooks/use-boolean";

export default function Page() {
  const router = useRouter();
  const [accessOrgs, setAccessOrgs] = useState([]);
  const [inOrgUsers, setInOrgUsers] = useState([]);
  const [bankTypes, setBankTypes] = useState([]);

  const fetchBankTypes = useCallback(async () => {
    try {
      const response = await myAxios.get(`/banks`);
      setBankTypes(response.data);
    } catch (error) {
      alert(error);
    }
  }, []);

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

  const schema = Yup.object().shape({
    id: Yup.string(),
    org_id: Yup.string().required(),
    user_id: Yup.string().required(),
    exe_confirm: Yup.string(),
    shbs_report: Yup.string(),
    bank_id: Yup.string(),
    loan_target: Yup.string(),
    ap_loan_applicable: Yup.string(),
    exe_date: Yup.string(),
    house_code: Yup.string(),
    house_name: Yup.string(),
    loan_amount: Yup.string(),
    deduction_amount: Yup.string(),
    heim_note: Yup.string(),
    shbs_note: Yup.string(),
    shbs_confirm: Yup.string(),
    collection_date: Yup.string(),
    receive_date: Yup.string(),
    registrate_date: Yup.string(),
    schedule_date: Yup.string(),
    establish_date: Yup.string(),
    doc_send_date: Yup.string(),
    confirm_date: Yup.string(),
  });

  const defaultValues = {
    id: "",
    org_id: "",
    user_id: "",
    exe_confirm: "",
    shbs_report: "",
    bank_id: "",
    loan_target: "",
    ap_loan_applicable: "",
    exe_date: "",
    house_code: "",
    house_name: "",
    loan_amount: "",
    deduction_amount: "",
    heim_note: "",
    shbs_note: "",
    shbs_confirm: "",
    collection_date: "",
    receive_date: "",
    registrate_date: "",
    schedule_date: "",
    establish_date: "",
    doc_send_date: "",
    confirm_date: "",
  };
  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema: schema,
    onSubmit: async (data) => {
      try {
        await myAxios.post("/case", data);
        router.push(`/dashboard/case-management`);
      } catch (error) {
        alert(error);
      }
    },
  });

  const fetchInOrgUsers = useCallback(
    async (org_id) => {
      try {
        const res = await myAxios.get(`/org/in/users?org_id=${org_id}`);
        setInOrgUsers(res.data);
      } catch (error) {
        alert(error);
      }
    },
    [formik.values.org_id]
  );

  useEffect(() => {
    if (formik.values.org_id !== "") {
      fetchInOrgUsers(formik.values.org_id);
    }
  }, [formik.values.org_id]);

  useEffect(() => {
    fetchAccessOrgs();
    fetchBankTypes();
  }, []);
  const open = useBoolean();
  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          案件新規
        </div>
      </div>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-end items-center">
        <div className=" space-x-2">
          <Button
            size="sm"
            color="secondary"
            variant="flat"
            onClick={() => router.push(`/dashboard/case-management`)}
          >
            戻る
          </Button>
          <Button size="sm" color="secondary" onClick={open.onTrue}>
            登録
          </Button>
          <Modal size="sm" isOpen={open.value} onClose={open.onFalse}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                案件登録
              </ModalHeader>
              <ModalBody>
                <p>案件を登録しますか？</p>
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
                    formik.handleSubmit();
                    open.onFalse();
                  }}
                >
                  はい
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
      <div className="h-full min-h-[calc(100vh_-_160px)] px-[8px] ">
        <Card className="w-full min-h-[calc(100vh_-_176px)] p-[8px] space-y-2 overflow-auto">
          <div className="space-y-2">
            <div className="text-secondary-600">担当者・確認情報</div>
            <div className="grid grid-cols-3">
              <div>
                <Select
                  size="sm"
                  label="支店名"
                  color="secondary"
                  className="w-[365px]"
                  classNames={{
                    label: "text-default-600",
                  }}
                  name="org_id"
                  value={formik.values.org_id}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.org_id ? [formik.values.org_id] : []
                  }
                  labelPlacement="outside"
                  placeholder="　"
                >
                  {accessOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  size="sm"
                  label="担当者"
                  color="secondary"
                  className="w-[365px]"
                  classNames={{
                    label: "text-default-600",
                  }}
                  name="user_id"
                  value={formik.values.user_id}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.user_id ? [formik.values.user_id] : []
                  }
                  isDisabled={!formik.values.org_id}
                  labelPlacement="outside"
                  placeholder="　"
                >
                  {inOrgUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex flex-row justify-between space-x-[8px]">
                <Select
                  size="sm"
                  label="管理担当用実行確定"
                  color="secondary"
                  className="w-[200px] min-w-[120px]"
                  classNames={{
                    label: "text-default-600 ",
                  }}
                  name="exe_confirm"
                  value={formik.values.exe_confirm}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.exe_confirm
                      ? [formik.values.exe_confirm]
                      : []
                  }
                  labelPlacement="outside"
                  placeholder="　"
                >
                  {["未", "済"].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  size="sm"
                  label="SHBS財務Ｇ報告用"
                  color="secondary"
                  className="w-[200px] min-w-[120px]"
                  classNames={{
                    label: "text-default-600",
                  }}
                  name="shbs_report"
                  value={formik.values.shbs_report}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.shbs_report
                      ? [formik.values.shbs_report]
                      : []
                  }
                  labelPlacement="outside"
                  placeholder="　"
                >
                  {["未", "済"].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  size="sm"
                  label="SHBS確認欄"
                  color="secondary"
                  className="w-[200px] min-w-[120px]"
                  classNames={{
                    label: "text-default-600",
                  }}
                  name="shbs_confirm"
                  value={formik.values.shbs_confirm}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.shbs_confirm
                      ? [formik.values.shbs_confirm]
                      : []
                  }
                  labelPlacement="outside"
                  placeholder="　"
                >
                  {["未", "済"].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-3">
            <div className="space-y-2">
              <div className="text-secondary-600">ローン情報</div>
              <div className="flex flex-col justify-start items-start space-y-2">
                <Select
                  size="sm"
                  name="bank_id"
                  value={formik.values.bank_id}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.bank_id ? [formik.values.bank_id] : []
                  }
                  color="secondary"
                  className="w-[365px]"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                  }}
                  label="金融機関"
                  labelPlacement="outside-left"
                >
                  {bankTypes.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  size="sm"
                  name="loan_target"
                  value={formik.values.loan_target}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.loan_target
                      ? [formik.values.loan_target]
                      : []
                  }
                  color="secondary"
                  className="w-[365px]"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[170px] min-w-[170px]",
                  }}
                  label="ローン対象"
                  labelPlacement="outside-left"
                >
                  {["土地", "建物中間", "建物最終"].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  size="sm"
                  name="ap_loan_applicable"
                  value={formik.values.ap_loan_applicable}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.ap_loan_applicable
                      ? [formik.values.ap_loan_applicable]
                      : []
                  }
                  color="secondary"
                  className="w-[365px]"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[170px] min-w-[170px]",
                  }}
                  label="APローン該当"
                  labelPlacement="outside-left"
                >
                  {["有", "無"].map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  size="sm"
                  type="date"
                  name="exe_date"
                  value={formik.values?.exe_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="実行日"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  name="house_code"
                  value={formik.values?.house_code}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="邸コード"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  name="house_name"
                  value={formik.values?.house_name}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="邸名"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  name="loan_amount"
                  value={formik.values?.loan_amount.toLocaleString()}
                  onChange={(e) => {
                    formik.setFieldValue(
                      "loan_amount",
                      !!e.target.value
                        ? parseInt(e.target.value.replaceAll(",", ""))
                        : ""
                    );
                  }}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="借入金額"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  name="deduction_amount"
                  value={
                    !!formik.values?.deduction_amount
                      ? formik.values?.deduction_amount.toLocaleString()
                      : ""
                  }
                  onChange={(e) => {
                    formik.setFieldValue(
                      "deduction_amount",
                      !!e.target.value
                        ? parseInt(e.target.value.replaceAll(",", ""))
                        : 0
                    );
                  }}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="差引諸費用"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  isReadOnly={true}
                  value={
                    formik.values?.loan_amount -
                      formik.values?.deduction_amount >
                    0
                      ? (
                          formik.values?.loan_amount -
                          formik.values?.deduction_amount
                        ).toLocaleString()
                      : ""
                  }
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="着金金額（自動計算）"
                  labelPlacement="outside-left"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-secondary-600">抵当権情報</div>
              <div className="flex flex-col justify-start items-start space-y-2">
                <Input
                  size="sm"
                  name="collection_date"
                  type="date"
                  value={formik.values?.collection_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="権利証（回収日）"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />

                <Input
                  size="sm"
                  name="receive_date"
                  type="date"
                  value={formik.values?.receive_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="抵当権（書類受理日）"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />

                <Input
                  size="sm"
                  name="registrate_date"
                  type="date"
                  value={formik.values?.registrate_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="抵当権（登記依頼日）"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />

                <Input
                  size="sm"
                  name="schedule_date"
                  type="date"
                  value={formik.values?.schedule_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="抵当権（完了予定日）"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />
                <Input
                  size="sm"
                  name="establish_date"
                  type="date"
                  value={formik.values?.establish_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="抵当権（設定日）"
                  labelPlacement="outside-left"
                  placeholder="yyyy-mm-dd"
                />

                <Input
                  size="sm"
                  name="doc_send_date"
                  type="date"
                  value={formik.values?.doc_send_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="抵当権（設定書類送付日）"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />

                <Input
                  size="sm"
                  name="confirm_date"
                  type="date"
                  value={formik.values?.confirm_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  classNames={{
                    label: "text-default-600 min-w-[155px]",
                    input: "w-[194px] min-w-[194px]",
                  }}
                  label="責任者確認日"
                  placeholder="yyyy-mm-dd"
                  labelPlacement="outside-left"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-secondary-600">備考情報</div>
              <div className="flex flex-col justify-between items-start space-y-2">
                <Textarea
                  name="heim_note"
                  value={formik.values?.heim_note}
                  onChange={formik.handleChange}
                  color="secondary"
                  label="備考(ハイム使用欄）"
                  className="min-w-xs w-full"
                  classNames={{
                    label: "text-default-600",
                    input: "min-h-[148px]",
                  }}
                />
                <Textarea
                  name="shbs_note"
                  value={formik.values?.shbs_note}
                  onChange={formik.handleChange}
                  color="secondary"
                  label="備考(ＳＨＢＳ使用欄）"
                  className="min-w-xs w-full"
                  classNames={{
                    label: "text-default-600",
                    input: "min-h-[148px]",
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Fragment>
  );
}
