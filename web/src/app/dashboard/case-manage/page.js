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
      console.log("fetchCases", res.data);
      setTableData(res.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, []);
  return (
    <Fragment>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <div className="text-[18px] text-secondary-600 font-medium">
          案件管理
        </div>
      </div>
      <div className="h-[48px] px-[16px] w-full flex flex-row justify-between items-center">
        <Input
          size="sm"
          color="secondary"
          isClearable={true}
          onClear={() => setFilters(defaultFilters)}
          value={filters?.name}
          labelPlacement="outline"
          placeholder="邸名で検索します"
          startContent={
            <Icon width={14} className="mb-0.5 " icon="bi:search" />
          }
          className="max-w-xs"
          classNames={{
            label: "text-black/50 dark:text-white/90",
          }}
          onChange={(e) => handleFilters("name", e.target.value)}
          isDisabled={!user?.permission_codes.includes("P001")}
        />
        <div className=" space-x-2">
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P004")}
          >
            案件インポート
          </Button>
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P005")}
          >
            案件エクスポート
          </Button>
          <Button
            size="sm"
            color="secondary"
            isDisabled={!user?.permission_codes.includes("P002")}
            onClick={() => router.push(`/dashboard/case-manage/new`)}
          >
            案件新規
          </Button>
        </div>
      </div>
      <div className="h-full max-h-[calc(100vh_-_160px)] p-[8px]">
        <Card className="h-[calc(100vh_-_174px)] py-[8px] ">
          <div className="h-[calc(100vh_-_190px)]  py-[4px] px-[8px] overflow-y-auto overflow-x-hidden space-y-2">
            {user?.permission_codes.includes("P001") &&
              dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((item) => (
                  <Card
                    key={item.id}
                    radius="sm"
                    className="border-none px-2 min-h-[164px]"
                    shadow="sm"
                  >
                    <CardHeader>
                      <div className="flex flex-row h-3 w-full justify-between items-center space-x-4 text-small ">
                        <div className="flex flex-row h-3 w-full justify-start items-center space-x-4">
                          <CellItemRow title="支店名" value={item.org_name} />
                          <CellItemRow title="担当者" value={item.name} />
                        </div>
                        <div className="flex flex-row h-3 w-full justify-end items-center space-x-4">
                          <CellItemRow
                            title="実行確定"
                            value={!!item.exe_confirm ? "済" : "未"}
                          />
                          <CellItemRow
                            title="SHBS財務Ｇ報告用"
                            value={!!item.shbs_report ? "済" : "未"}
                          />
                          <CellItemRow
                            title="SHBS確認欄"
                            value={!!item.shbs_confirm ? "済" : "未"}
                          />
                          <Button
                            size="sm"
                            color="secondary"
                            className="h-7"
                            onClick={() =>
                              router.push(
                                `/dashboard/case-manage/edit?case_id=${item.id}`
                              )
                            }
                            isDisabled={
                              !user?.permission_codes.includes("P003")
                            }
                          >
                            編集
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="flex flex-row justify-between">
                        <div className="w-full grid grid-cols-5 gap-1 text-small ">
                          <CellItemRow
                            title="金融機関名"
                            value={item.bank_name}
                          />
                          <CellItemRow title="提携種別" value={item.type} />
                          <CellItemRow
                            title="ローン対象"
                            value={item.loan_target}
                          />
                          <CellItemRow
                            title="APローン該当"
                            value={item.ap_loan_applicable}
                          />
                          <CellItemRow
                            title="実行日"
                            value={item.excute_date}
                          />

                          <CellItemRow
                            title="邸コード"
                            value={item.house_code}
                          />
                          <CellItemRow title="邸名" value={item.house_name} />
                          <CellItemRow
                            title="借入金額"
                            value={item.loan_amount.toLocaleString()}
                          />
                           <CellItemRow
                            title="差引諸費用"
                            value={item.deposit_amount.toLocaleString()}
                          />
                          <CellItemRow
                            title="着金金額"
                            value={
                              item.deduction_amount > 0
                                ? item.deduction_amount.toLocaleString()
                                : "ーー"
                            }
                          />
                         
                        </div>
                        <div className="flex flex-row space-x-2 ">
                          <CellItemTextArea
                            title="備考(ハイム使用欄）"
                            value={item.heim_note}
                          />
                          <CellItemTextArea
                            title="備考(ＳＨＢＳ使用欄）"
                            value={item.shbs_note}
                          />
                        </div>
                      </div>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                      <div className="h-4 w-full flex flex-row justify-between items-center space-x-2 text-small">
                        <CellItemCol
                          title="権利証（回収日）"
                          value={item.collection_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="抵当権（書類受理日）"
                          value={item.receive_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="抵当権（登記依頼日）"
                          value={item.registrate_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="抵当権（完了予定日）"
                          value={item.schedule_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="抵当権（設定日）"
                          value={item.establish_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="抵当権（設定書類送付日）"
                          value={item.doc_send_date}
                        />
                        <Divider orientation="vertical" />
                        <CellItemCol
                          title="責任者確認日"
                          value={item.confirm_date}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            {dataFiltered.slice(
              table.page * table.rowsPerPage,
              table.page * table.rowsPerPage + table.rowsPerPage
            ).length === 0 && (
              <div className=" w-full h-[200px] text-center mt-20">
                表示できるデータがありません。
              </div>
            )}
          </div>
        </Card>
      </div>
    </Fragment>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((item) => item.house_name.includes(name));
  }

  return inputData;
}

// ----------------------------------------------------------------------

const CellItemCol = ({ title, value }) => {
  return (
    <div className="flex flex-col justify-start items-start space-y-[2px]">
      <div className="text-[10px] text-secondary-400 leading-[10px]">
        {title}
      </div>
      <div
        radius="sm"
        className="text-[14px] leading-[16px] text-secondary-800"
      >
        {!!value ? value : "ーー"}
      </div>
    </div>
  );
};

const CellItemRow = ({ title, value }) => {
  return (
    <div className="flex flex-row justify-start items-center space-x-[2px]">
      <div className="text-[12px] text-secondary-400 ">{title}:</div>
      <div className="text-[12px] text-secondary-800">
        {!!value ? value : "ーー"}
      </div>
    </div>
  );
};

const CellItemTextArea = ({ title, value }) => {
  return (
    <div className=" min-h-[60px] min-w-[180px] flex flex-col justify-start items-start space-x-[2px]  p-1  border-[1px] rounded-md">
      <div className="text-[9px] text-secondary-400 ">{title}:</div>
      <div className="text-[9px] text-secondary-800">
        {!!value ? value : "ーー"}
      </div>
    </div>
  );
};
