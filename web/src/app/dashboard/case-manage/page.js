"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  CardFooter,
  Table,
  TableHeader,
  TableColumn,
  TableCell,
  TableRow,
  TableBody,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import myAxios from "@/utils/my-axios";
import { Icon } from "@iconify/react";
import { jwtDecode } from "jwt-decode";
import useTable from "@/hooks/use-table";
import { useAuthContext } from "@/hooks/use-auth-context";

// ----------------------------------------------------------------------
const defaultFilters = {
  name: "",
  house_name: "",
  house_code: "",
  exe_confirm: "",
  shbs_report: "",
  shbs_confirm: "",
  org_name: "",
  bank_name: "",
  type: "",
  loan_target: "",
  ap_loan_applicable: "",
};

export default function Page() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable();
  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: table.getComparator(table.order, table.orderBy),
    filters,
  });

  const fetchCases = useCallback(async () => {
    try {
      const res = await myAxios.get(
        `/cases?role_id=${
          jwtDecode(localStorage.getItem("accessToken", {}))?.default_role_id
        }`
      );
      setTableData(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

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

  const fetchInOrgUsers = useCallback(
    async (org_id) => {
      try {
        const res = await myAxios.get(`/org/in/users?org_id=${org_id}`);
        setInOrgUsers(res.data);
      } catch (error) {
        alert(error);
      }
    },
    [filters.org_name]
  );

  useEffect(() => {
    if (filters.org_name !== "") {
      fetchInOrgUsers(
        accessOrgs.find((item) => item.name === filters.org_name)?.id
      );
    } else {
      setFilters({ ...filters, name: "" });
    }
  }, [filters.org_name]);

  useEffect(() => {
    fetchAccessOrgs();
    fetchBankTypes();
    fetchCases();
  }, []);

  const downloadFile = ({ data, fileName, fileType }) => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const exportToCsv = (e) => {
    e.preventDefault();
    // Headers for each column
    let headers = [
      "実行確定",
      "Ｇ報告用",
      "支店名",
      "担当者",
      "邸コード",
      "邸名",
      "金融機関",
      "提携先",
      "ローン対象",
      "APローン該当",
      "実行日",
      "借入金額",
      "差引諸費用",
      "着金金額",
      "備考（ハイム使用欄）",
      "備考（ＳＨＢＳ使用欄）",
      "SHBS確認欄",
      "権利証（回収日）",
      "抵当権（書類受理日）",
      "抵当権（登記依頼日）",
      "抵当権（完了予定日）",
      "抵当権（設定日）",
      "抵当権（設定書類送付日）",
      "責任者確認日",
    ];
    // Convert users data to a csv
    let usersCsv = tableData.reduce((acc, user) => {
      const {
        exe_confirm,
        shbs_report,
        org_name,
        name,
        house_code,
        house_name,
        bank_name,
        type,
        loan_target,
        ap_loan_applicable,
        excute_date,
        loan_amount,
        deduction_amount,
        deposit_amount,
        heim_note,
        shbs_note,
        shbs_confirm,
        collection_date,
        receive_date,
        registrate_date,
        schedule_date,
        establish_date,
        doc_send_date,
        confirm_date,
      } = user;
      acc.push(
        [
          exe_confirm,
          shbs_report,
          org_name,
          name,
          house_code,
          house_name,
          bank_name,
          type,
          loan_target,
          ap_loan_applicable,
          excute_date,
          loan_amount,
          deduction_amount,
          deposit_amount,
          heim_note,
          shbs_note,
          shbs_confirm,
          collection_date,
          receive_date,
          registrate_date,
          schedule_date,
          establish_date,
          doc_send_date,
          confirm_date,
        ].join(",")
      );
      return acc;
    }, []);
    downloadFile({
      data: [headers.join(","), ...usersCsv].join("\n"),
      fileName: "export.csv",
      fileType: "text/csv",
    });
  };

  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          案件管理
        </div>
      </div>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-end items-center">
        <div className=" space-x-2">
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P004")}
          >
            インポート
          </Button>
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P005")}
            onClick={exportToCsv}
          >
            エクスポート
          </Button>
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P002")}
            onClick={() => router.push(`/dashboard/case-manage/new`)}
          >
            新規
          </Button>
        </div>
      </div>
      <div className="h-[64px] px-[16px] w-full flex flex-row justify-start items-end space-x-2">
        <Select
          size="sm"
          label="実行確定"
          color="secondary"
          className="w-[80px] min-w-[80px]"
          classNames={{
            label: "text-default-600 ",
          }}
          value={filters.exe_confirm}
          onChange={(e) =>
            setFilters({ ...filters, exe_confirm: e.target.value })
          }
          selectedKeys={[filters?.exe_confirm]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {["未", "済"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="Ｇ報告用"
          color="secondary"
          className="w-[80px] min-w-[80px]"
          classNames={{
            label: "text-default-600 ",
          }}
          value={filters.shbs_report}
          onChange={(e) =>
            setFilters({ ...filters, shbs_report: e.target.value })
          }
          selectedKeys={[filters?.shbs_report]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
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
          className="w-[80px] min-w-[80px]"
          classNames={{
            label: "text-default-600 ",
          }}
          value={filters.shbs_confirm}
          onChange={(e) =>
            setFilters({ ...filters, shbs_confirm: e.target.value })
          }
          selectedKeys={[filters?.shbs_confirm]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {["未", "済"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="支店名"
          color="secondary"
          className="w-[120px] min-w-[120px]"
          classNames={{
            label: "text-default-600",
          }}
          value={filters.org_name}
          onChange={(e) => setFilters({ ...filters, org_name: e.target.value })}
          selectedKeys={[filters.org_name]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {accessOrgs.map((org) => (
            <SelectItem key={org.name} value={org.name}>
              {org.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="担当者"
          color="secondary"
          className="w-[120px] min-w-[120px]"
          classNames={{
            label: "text-default-600",
          }}
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          selectedKeys={[filters.name]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {inOrgUsers.map((user) => (
            <SelectItem key={user.name} value={user.name}>
              {user.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          value={filters.bank_name}
          onChange={(e) =>
            setFilters({ ...filters, bank_name: e.target.value })
          }
          selectedKeys={[filters?.bank_name]}
          color="secondary"
          className="w-[200px] min-w-[200px]"
          classNames={{
            label: "text-default-600",
          }}
          label="金融機関"
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {bankTypes.map((option) => (
            <SelectItem key={option.name} value={option.name}>
              {option.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="ローン対象"
          color="secondary"
          className="w-[120px] min-w-[120px]"
          classNames={{
            label: "text-default-600 ",
          }}
          value={filters.loan_target}
          onChange={(e) =>
            setFilters({ ...filters, loan_target: e.target.value })
          }
          selectedKeys={[filters?.loan_target]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {["土地", "建物中間", "建物最終"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="APローン該当"
          color="secondary"
          className="w-[90px] min-w-[90px]"
          classNames={{
            label: "text-default-600 ",
          }}
          value={filters.ap_loan_applicable}
          onChange={(e) =>
            setFilters({ ...filters, ap_loan_applicable: e.target.value })
          }
          selectedKeys={[filters?.ap_loan_applicable]}
          labelPlacement="outside"
          placeholder="　"
        >
          <SelectItem key={""} value={""}>
            ALL
          </SelectItem>
          {["有", "無"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </Select>
        <Input
          size="sm"
          color="secondary"
          isClearable={true}
          onClear={() => setFilters(defaultFilters)}
          value={filters?.house_code}
          labelPlacement="outside"
          placeholder="邸コードで検索します"
          label="邸コード"
          startContent={
            <Icon width={14} className="mb-0.5 " icon="bi:search" />
          }
          className="max-w-xs"
          classNames={{
            label: "text-default-600 ",
          }}
          onChange={(e) => handleFilters("house_code", e.target.value)}
          isDisabled={!user?.permission_codes.includes("P001")}
        />
        <Input
          size="sm"
          color="secondary"
          isClearable={true}
          onClear={() => setFilters(defaultFilters)}
          value={filters?.house_name}
          labelPlacement="outside"
          placeholder="邸名で検索します"
          label="邸名"
          startContent={
            <Icon width={14} className="mb-0.5 " icon="bi:search" />
          }
          className="max-w-xs"
          classNames={{
            label: "text-default-600 ",
          }}
          onChange={(e) => handleFilters("house_name", e.target.value)}
          isDisabled={!user?.permission_codes.includes("P001")}
        />
      </div>
      <div className="h-full max-h-[calc(100vh_-_224px)] p-[8px] max-w-[calc(100vw_-_64px)]">
        <Table
          isHeaderSticky
          aria-label="org users"
          color="secondary"
          className="table-fixed w-full"
          classNames={{
            wrapper:
              "max-w-[calc(100vw_-_64px)] h-[calc(100vh_-_234px)] max-h-[calc(100vh_-_234px)] p-0 ",
          }}
          sortDescriptor={{ column: table.orderBy, direction: table.order }}
          onSortChange={(v) => {
            table.setOrderBy(v?.column);
            table.setOrder(v?.direction);
          }}
        >
          <TableHeader className=" bg-green-500 ">
            <TableColumn
              key="exe_confirm"
              className="sticky left-0 min-w-[60px] max-w-[60px] z-50 whitespace-nowrap text-center"
            >
              実行確定
            </TableColumn>
            <TableColumn
              key="shbs_report"
              className="sticky left-[60px] min-w-[60px] max-w-[60px] z-50 whitespace-nowrap text-center"
            >
              Ｇ報告用
            </TableColumn>
            <TableColumn
              key="org_name"
              className="sticky left-[120px] min-w-[90px] max-w-[90px] z-50 whitespace-nowrap text-center"
            >
              支店名
            </TableColumn>
            <TableColumn
              key="name"
              className="sticky left-[210px] min-w-[70px] max-w-[70px] z-50 whitespace-nowrap text-center"
            >
              担当者
            </TableColumn>
            <TableColumn
              key="house_code"
              className="sticky left-[280px] min-w-[100px] max-w-[100px] z-50 whitespace-nowrap text-center"
            >
              邸コード
            </TableColumn>
            <TableColumn
              key="house_name"
              className="sticky left-[380px] min-w-[120px] max-w-[120px] z-50 whitespace-nowrap text-center"
            >
              邸名
            </TableColumn>
            <TableColumn
              key="bank_name"
              className="whitespace-nowrap text-center"
            >
              金融機関
            </TableColumn>
            <TableColumn key="type" className="whitespace-nowrap text-center">
              提携先
            </TableColumn>
            <TableColumn
              key="loan_target"
              className="whitespace-nowrap text-center"
            >
              ローン対象
            </TableColumn>
            <TableColumn
              key="ap_loan_applicable"
              className="whitespace-nowrap text-center"
            >
              APローン該当
            </TableColumn>
            <TableColumn
              key="excute_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              実行日
            </TableColumn>
            <TableColumn
              key="loan_amount"
              allowsSorting
              className="w-full whitespace-nowrap text-end"
            >
              借入金額
            </TableColumn>
            <TableColumn
              key="deduction_amount"
              allowsSorting
              className="w-full whitespace-nowrap text-end"
            >
              差引諸費用
            </TableColumn>
            <TableColumn
              key="deposit_amount"
              allowsSorting
              className="w-full whitespace-nowrap text-end"
            >
              着金金額
            </TableColumn>
            <TableColumn key="heim_note" className="whitespace-nowrap">
              備考（ハイム使用欄）
            </TableColumn>
            <TableColumn key="shbs_note" className="whitespace-nowrap">
              備考（ＳＨＢＳ使用欄）
            </TableColumn>
            <TableColumn key="shbs_confirm" className="whitespace-nowrap">
              SHBS確認欄
            </TableColumn>
            <TableColumn
              key="collection_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              権利証（回収日）
            </TableColumn>
            <TableColumn
              key="receive_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              抵当権（書類受理日）
            </TableColumn>
            <TableColumn
              key="registrate_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              抵当権（登記依頼日）
            </TableColumn>
            <TableColumn
              key="schedule_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              抵当権（完了予定日）
            </TableColumn>
            <TableColumn
              key="establish_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              抵当権（設定日）
            </TableColumn>
            <TableColumn
              key="doc_send_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              抵当権（設定書類送付日）
            </TableColumn>
            <TableColumn
              key="confirm_date"
              allowsSorting
              className="whitespace-nowrap"
            >
              責任者確認日
            </TableColumn>
            <TableColumn
              key="action"
              className="whitespace-nowrap"
            ></TableColumn>
          </TableHeader>
          <TableBody>
            {dataFiltered
              .slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="sticky left-0 min-w-[60px] max-w-[60px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.exe_confirm || "ーー"}
                  </TableCell>
                  <TableCell className="sticky left-[60px] min-w-[60px] max-w-[60px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.shbs_report || "ーー"}
                  </TableCell>
                  <TableCell className="sticky left-[120px] min-w-[90px] max-w-[90px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.org_name || "ーー"}
                  </TableCell>
                  <TableCell className="sticky left-[210px] min-w-[70px] max-w-[70px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.name}
                  </TableCell>
                  <TableCell className="sticky left-[280px] min-w-[100px] max-w-[100px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.house_code || "ーー"}
                  </TableCell>
                  <TableCell className="sticky left-[380px] min-w-[120px] max-w-[120px] bg-white z-50 whitespace-nowrap text-center">
                    {row?.house_name || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-center">
                    {row?.bank_name || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-center">
                    {row?.type || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-center">
                    {row?.loan_target || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-center">
                    {row?.ap_loan_applicable || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.excute_date || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-end">
                    {!!row?.loan_amount
                      ? row?.loan_amount.toLocaleString()
                      : "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-end">
                    {!!row?.deduction_amount
                      ? row?.deduction_amount.toLocaleString()
                      : "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-end">
                    {!!row?.deposit_amount
                      ? row?.deposit_amount.toLocaleString()
                      : "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.heim_note || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.shbs_note || "ーー"}
                  </TableCell>
                  <TableCell className="w-full whitespace-nowrap text-center">
                    {row?.shbs_confirm || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.collection_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.receive_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.registrate_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.schedule_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.establish_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.doc_send_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row?.confirm_date || "ーー"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-end">
                    <Button
                      size="sm"
                      color="secondary"
                      isIconOnly
                      onClick={() =>
                        router.push(
                          `/dashboard/case-manage/edit?case_id=${row.id}`
                        )
                      }
                    >
                      <Icon width={16} icon="bi:pencil" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </Fragment>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const {
    name,
    house_name,
    house_code,
    exe_confirm,
    shbs_report,
    shbs_confirm,
    org_name,
    bank_name,
    loan_target,
    ap_loan_applicable,
  } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (house_name) {
    inputData = inputData.filter((item) =>
      item.house_name.includes(house_name)
    );
  }

  if (house_code) {
    inputData = inputData.filter((item) =>
      item.house_code.includes(house_code)
    );
  }

  if (name) {
    inputData = inputData.filter((item) => item.name === name);
  }

  if (exe_confirm) {
    inputData = inputData.filter((item) => item.exe_confirm === exe_confirm);
  }

  if (shbs_report) {
    inputData = inputData.filter((item) => item.shbs_report === shbs_report);
  }

  if (shbs_confirm) {
    inputData = inputData.filter((item) => item.shbs_confirm === shbs_confirm);
  }

  if (org_name) {
    inputData = inputData.filter((item) => item.org_name === org_name);
  }

  if (bank_name) {
    inputData = inputData.filter((item) => item.bank_name === bank_name);
  }

  if (loan_target) {
    inputData = inputData.filter((item) => item.loan_target === loan_target);
  }

  if (ap_loan_applicable) {
    inputData = inputData.filter(
      (item) => item.ap_loan_applicable === ap_loan_applicable
    );
  }

  return inputData;
}
