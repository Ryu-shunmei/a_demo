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
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useBoolean } from "@/hooks/use-boolean";

export default function Page() {
  const [accessOrgs, setAccessOrgs] = useState([]);
  const [inOrgUsers, setInOrgUsers] = useState([]);
  const [bankTypes, setBankTypes] = useState([]);
  const router = useRouter();
  const search = useSearchParams();
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
        `/options/orgs?role_id=${jwtDecode(localStorage.getItem("accessToken", {}))?.default_role_id
        }`
      );
      console.log("fetchAccessOrgs", res.data);
      setAccessOrgs(res.data);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }, []);

  const schema = Yup.object().shape({
    id: Yup.string(),
    org_id: Yup.string().required(),
    user_id: Yup.string().required(),
    exe_confirm: Yup.bool(),
    shbs_report: Yup.bool(),
    bank_id: Yup.string(),
    loan_target: Yup.string(),
    ap_loan_applicable: Yup.string(),
    exe_date: Yup.string(),
    house_code: Yup.string(),
    house_name: Yup.string(),
    loan_amount: Yup.string(),
    deposit_amount: Yup.string(),
    heim_note: Yup.string(),
    shbs_note: Yup.string(),
    shbs_confirm: Yup.bool(),
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
    exe_confirm: false,
    shbs_report: false,
    bank_id: "",
    loan_target: "",
    ap_loan_applicable: "",
    exe_date: "",
    house_code: "",
    house_name: "",
    loan_amount: "",
    deposit_amount: "",
    heim_note: "",
    shbs_note: "",
    shbs_confirm: false,
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
        await myAxios.put("/case", { ...data, deposit_amount: !!data.deposit_amount ? data.deposit_amount : 0 });
        router.push(`/dashboard/case-manage`);
      } catch (error) {
        console.log(error);
      }
    },
  });

  const fetchInOrgUsers = useCallback(
    async (org_id) => {
      try {
        const res = await myAxios.get(`/org/in/users?org_id=${org_id}`);
        console.log("fetchInOrgUsers", res.data);
        setInOrgUsers(res.data);
      } catch (error) {
        console.log("fetchInOrgUsers", error);
        alert(error);
      }
    },
    [formik.values.org_id]
  );

  const fetchCaseOptions = useCallback(async () => {
    try {
      const response = await myAxios.get(`/case/${search.get("case_id")}`);
      console.log("fetchCaseOptions", response.data);
      formik.setFieldValue("id", !!response.data.id ? response.data.id : "");
      formik.setFieldValue(
        "org_id",
        !!response.data.org_id ? response.data.org_id : ""
      );
      formik.setFieldValue(
        "user_id",
        !!response.data.user_id ? response.data.user_id : ""
      );
      formik.setFieldValue(
        "exe_confirm",
        !!response.data.exe_confirm ? response.data.exe_confirm : false
      );
      formik.setFieldValue(
        "shbs_report",
        !!response.data.shbs_report ? response.data.shbs_report : false
      );
      formik.setFieldValue(
        "bank_id",
        !!response.data.bank_id ? response.data.bank_id : ""
      );
      formik.setFieldValue(
        "loan_target",
        !!response.data.loan_target ? response.data.loan_target : ""
      );
      formik.setFieldValue(
        "ap_loan_applicable",
        !!response.data.ap_loan_applicable
          ? response.data.ap_loan_applicable
          : ""
      );
      formik.setFieldValue(
        "exe_date",
        !!response.data.exe_date ? response.data.exe_date : ""
      );
      formik.setFieldValue(
        "house_code",
        !!response.data.house_code ? response.data.house_code : ""
      );
      formik.setFieldValue(
        "house_name",
        !!response.data.house_name ? response.data.house_name : ""
      );
      formik.setFieldValue(
        "loan_amount",
        !!response.data.loan_amount ? response.data.loan_amount : ""
      );
      formik.setFieldValue(
        "deposit_amount",
        !!response.data.deposit_amount ? response.data.deposit_amount : ""
      );
      formik.setFieldValue(
        "heim_note",
        !!response.data.heim_note ? response.data.heim_note : ""
      );
      formik.setFieldValue(
        "shbs_note",
        !!response.data.shbs_note ? response.data.shbs_note : ""
      );
      formik.setFieldValue(
        "shbs_confirm",
        !!response.data.shbs_confirm ? response.data.shbs_confirm : false
      );
      formik.setFieldValue(
        "collection_date",
        !!response.data.collection_date ? response.data.collection_date : ""
      );
      formik.setFieldValue(
        "receive_date",
        !!response.data.receive_date ? response.data.receive_date : ""
      );
      formik.setFieldValue(
        "registrate_date",
        !!response.data.registrate_date ? response.data.registrate_date : ""
      );
      formik.setFieldValue(
        "schedule_date",
        !!response.data.schedule_date ? response.data.schedule_date : ""
      );
      formik.setFieldValue(
        "establish_date",
        !!response.data.establish_date ? response.data.establish_date : ""
      );
      formik.setFieldValue(
        "doc_send_date",
        !!response.data.doc_send_date ? response.data.doc_send_date : ""
      );
      formik.setFieldValue(
        "confirm_date",
        !!response.data.confirm_date ? response.data.confirm_date : ""
      );
    } catch (error) {
      console.log("fetchCaseOptions", error);
      alert(error);
    }
  }, []);

  useEffect(() => {
    if (formik.values.org_id !== "") {
      fetchInOrgUsers(formik.values.org_id);
    }
  }, [formik.values.org_id]);
  useEffect(() => {
    fetchCaseOptions();
    fetchAccessOrgs();
    fetchBankTypes();
  }, []);
  const open = useBoolean()
  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          案件新規
        </div>
        <div className=" space-x-2">
          <Button
            size="sm"
            color="secondary"
            variant="flat"
            onClick={() => router.push(`/dashboard/case-manage`)}
          >
            戻る
          </Button>
          <Button size="sm" color="secondary" onClick={open.onTrue}>
            更新
          </Button>
          <Modal size="sm" isOpen={open.value} onClose={open.onFalse}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                案件更新
              </ModalHeader>
              <ModalBody>
                <p>
                  案件を更新しますか？
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
                    formik.handleSubmit()
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
      <div className="h-full min-h-[calc(100vh_-_112px)] px-[8px] ">
        <Card className="h-full min-h-[calc(100vh_-_128px)] p-[8px] space-y-2">
          <div className=" space-y-2">
            <div>担当者情報</div>
            <div className="flex flex-row justify-start items-center space-x-2">
              <Select
                aria-label="org_id"
                color="secondary"
                labelPlacement="outside"
                className="w-[320px]"
                name="org_id"
                value={formik.values.org_id}
                onChange={formik.handleChange}
                selectedKeys={
                  !!formik.values.org_id ? [formik.values.org_id] : []
                }
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-[12px] min-w-[40px] text-start">
                      支店名:
                    </span>
                  </div>
                }
              >
                {accessOrgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                aria-label="user_id"
                color="secondary"
                labelPlacement="outside"
                className="w-[320px]"
                name="user_id"
                value={formik.values.user_id}
                onChange={formik.handleChange}
                selectedKeys={
                  !!formik.values.user_id ? [formik.values.user_id] : []
                }
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-[12px] min-w-[40px] text-start">
                      担当者:
                    </span>
                  </div>
                }
              >
                {inOrgUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <Divider />
          <div className=" space-y-2">
            <div>ローン情報</div>
            <div className="space-y-2">
              <div className=" space-x-3">
                <Checkbox
                  size="sm"
                  name="exe_confirm"
                  color="secondary"
                  isSelected={formik.values.exe_confirm}
                  onValueChange={(v) => {
                    console.log(v);
                    formik.setFieldValue("exe_confirm", v);
                  }}
                >
                  実行確定
                </Checkbox>
                <Checkbox
                  size="sm"
                  name="shbs_report"
                  color="secondary"
                  isSelected={formik.values.shbs_report}
                  onValueChange={(v) => formik.setFieldValue("shbs_report", v)}
                >
                  SHBS財務Ｇ報告用
                </Checkbox>
                <Checkbox
                  size="sm"
                  name="shbs_confirm"
                  color="secondary"
                  isSelected={formik.values.shbs_confirm}
                  onValueChange={(v) => formik.setFieldValue("shbs_confirm", v)}
                >
                  SHBS確認欄
                </Checkbox>
              </div>
              <div className=" flex flex-row space-x-2">
                <Select
                  name="bank_id"
                  value={formik.values.bank_id}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.bank_id ? [formik.values.bank_id] : []
                  }
                  color="secondary"
                  className="w-[320px]"
                  aria-label="所属金融機関"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[55px] text-start">
                        金融機関:
                      </span>
                    </div>
                  }
                >
                  {bankTypes.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  name="loan_target"
                  value={formik.values.loan_target}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.loan_target
                      ? [formik.values.loan_target]
                      : []
                  }
                  color="secondary"
                  className="w-[320px]"
                  aria-label="ローン対象"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[65px] text-start">
                        ローン対象:
                      </span>
                    </div>
                  }
                >
                  <SelectItem key="土地" value="土地">
                    土地
                  </SelectItem>
                  <SelectItem key="建物中間" value="建物中間">
                    建物中間
                  </SelectItem>
                  <SelectItem key="建物最終" value="建物最終">
                    建物最終
                  </SelectItem>
                </Select>
                <Select
                  name="ap_loan_applicable"
                  value={formik.values.ap_loan_applicable}
                  onChange={formik.handleChange}
                  selectedKeys={
                    !!formik.values.ap_loan_applicable
                      ? [formik.values.ap_loan_applicable]
                      : []
                  }
                  color="secondary"
                  className="w-[320px]"
                  aria-label="APローン該当"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[80px] text-start">
                        APローン該当:
                      </span>
                    </div>
                  }
                >
                  <SelectItem key="有" value="有">
                    有
                  </SelectItem>
                  <SelectItem key="無" value="無">
                    無
                  </SelectItem>
                </Select>
                <Input
                  name="exe_date"
                  type="date"
                  value={formik.values?.exe_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="実行日"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[40px] text-start">
                        実行日:
                      </span>
                    </div>
                  }
                />
              </div>
              <div className=" flex flex-row space-x-2">
                <Input
                  name="house_code"
                  value={formik.values?.house_code}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="邸コード"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[55px] text-start">
                        邸コード:
                      </span>
                    </div>
                  }
                />
                <Input
                  name="house_name"
                  value={formik.values?.house_name}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="邸名"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[30px] text-start">
                        邸名:
                      </span>
                    </div>
                  }
                />
                <Input
                  name="loan_amount"
                  type="number"
                  value={formik.values?.loan_amount}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="借入金額"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[90px] text-start">
                        借入金額(円):
                      </span>
                    </div>
                  }
                />
                <Input
                  name="deposit_amount"
                  type="number"
                  value={formik.values?.deposit_amount}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="差引諸費用"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[90px] text-start">
                        差引諸費用(円):
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
          <Divider />
          <div className=" space-y-2">
            <div>抵当権情報</div>
            <div className="space-y-2">
              <div className=" flex flex-row space-x-2">
                <Input
                  name="collection_date"
                  type="date"
                  value={formik.values?.collection_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="権利証（回収日"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[90px] text-start">
                        権利証（回収日:
                      </span>
                    </div>
                  }
                />

                <Input
                  name="receive_date"
                  type="date"
                  value={formik.values?.receive_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="抵当権（書類受理日）"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[130px] text-start">
                        抵当権（書類受理日）:
                      </span>
                    </div>
                  }
                />

                <Input
                  name="registrate_date"
                  type="date"
                  value={formik.values?.registrate_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="抵当権（登記依頼日）"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[125px] text-start">
                        抵当権（登記依頼日）:
                      </span>
                    </div>
                  }
                />

                <Input
                  name="schedule_date"
                  type="date"
                  value={formik.values?.schedule_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="抵当権（完了予定日）"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[125px] text-start">
                        抵当権（完了予定日）:
                      </span>
                    </div>
                  }
                />
              </div>
              <div className=" flex flex-row space-x-2">
                <Input
                  name="establish_date"
                  type="date"
                  value={formik.values?.establish_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="抵当権（設定日）"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[100px] text-start">
                        抵当権（設定日）:
                      </span>
                    </div>
                  }
                />

                <Input
                  name="doc_send_date"
                  type="date"
                  value={formik.values?.doc_send_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="抵当権（設定書類送付日）"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[150px] text-start">
                        抵当権（設定書類送付日）:
                      </span>
                    </div>
                  }
                />

                <Input
                  name="confirm_date"
                  type="date"
                  value={formik.values?.confirm_date}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="責任者確認日"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[80px] text-start">
                        責任者確認日:
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
          <Divider />
          <div className=" space-y-2">
            <div>備考情報</div>
            <div className="flex flex-row justify-start items-center space-x-2">
              <Textarea
                name="heim_note"
                value={formik.values?.heim_note}
                onChange={formik.handleChange}
                color="secondary"
                label="備考(ハイム使用欄）"
              />
              <Textarea
                name="shbs_note"
                value={formik.values?.shbs_note}
                onChange={formik.handleChange}
                color="secondary"
                label="備考(ＳＨＢＳ使用欄）"
              />
            </div>
          </div>
        </Card>
      </div>
    </Fragment>
  );
}
