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
} from "@nextui-org/react";

import myAxios from "@/utils/my-axios";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

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
      console.log(data);
      try {
        await myAxios.post("/case", data);
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

  useEffect(() => {
    if (formik.values.org_id !== "") {
      fetchInOrgUsers(formik.values.org_id);
    }
  }, [formik.values.org_id]);
  useEffect(() => {
    fetchAccessOrgs();
    fetchBankTypes();
  }, []);
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
          <Button size="sm" color="secondary" onClick={formik.handleSubmit}>
            確認
          </Button>
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
                  onValueChange={(v) => formik.setFieldValue("shbs_report", v)}
                >
                  SHBS財務Ｇ報告用
                </Checkbox>
                <Checkbox
                  size="sm"
                  name="shbs_confirm"
                  color="secondary"
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
                  aria-label="所属銀行"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[55px] text-start">
                        所属銀行:
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
                  value={formik.values?.loan_amount}
                  onChange={formik.handleChange}
                  color="secondary"
                  className="w-[320px]"
                  aria-label="借入金額"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[55px] text-start">
                        借入金額:
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
                  aria-label="着金金額"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-[12px] min-w-[55px] text-start">
                        着金金額:
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
