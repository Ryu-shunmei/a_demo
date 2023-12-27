from providers.psql_provider import DB


async def insert_case(db: DB, data: dict):
    sql = f"""
    INSERT INTO cases
        (
            org_id,
            user_id,
            exe_confirm,
            shbs_report,
            bank_id,
            loan_target,
            ap_loan_applicable,
            exe_date,
            house_code,
            house_name,
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
            confirm_date
        )
    VALUES
        (
            '{data["org_id"]}',
            '{data["user_id"]}',
            '{data["exe_confirm"]}',
            '{data["shbs_report"]}',
            '{data["bank_id"]}',
            '{data["loan_target"]}',
            '{data["ap_loan_applicable"]}',
            '{data["exe_date"]}',
            '{data["house_code"]}',
            '{data["house_name"]}',
            {int(data["loan_amount"]if data["loan_amount"] else 0)},
            {int(data["deduction_amount"] if data["deduction_amount"] else 0)},
            {int(data["loan_amount"])-int(data["deduction_amount"] if data["deduction_amount"] else 0)},
            '{data["heim_note"]}',
            '{data["shbs_note"]}',
            '{data["shbs_confirm"]}',
            '{data["collection_date"]}',
            '{data["receive_date"]}',
            '{data["registrate_date"]}',
            '{data["schedule_date"]}',
            '{data["establish_date"]}',
            '{data["doc_send_date"]}',
            '{data["confirm_date"]}'
        );
    """
    sql = sql.replace("''", "null")
    await db.execute(sql)


async def query_access_cases(db: DB, role_id: str):
    role = await db.fetch_one(f"SELECT org_id FROM roles WHERE id = '{role_id}'")
    sql = f"""
    WITH RECURSIVE parents AS (
        SELECT id, type, name, parent_id, 0 as depth FROM orgs WHERE id = '{role["org_id"] if role else "null"}'
        UNION ALL
        SELECT child.id, child.type, child.name, child.parent_id, parents.depth + 1 as depth FROM orgs as child INNER JOIN parents ON parents.id = child.parent_id
    )
    SELECT
        parents.*,
        org_types.weight as weight
    FROM
        parents
    LEFT JOIN
        org_types
        ON
        org_types.code = parents.type;
    """
    basic_orgs = await db.fetch_all(sql)
    cases = []
    for org in basic_orgs:
        sql = f"""
        SELECT
            cases.id,
            cases.org_id,
            cases.user_id,
            cases.exe_confirm,
            cases.shbs_report,
            cases.bank_id,
            cases.loan_target,
            cases.ap_loan_applicable,
            cases.exe_date,
            cases.house_code,
            cases.house_name,
            cases.loan_amount,
            cases.deduction_amount,
            cases.deposit_amount,
            cases.heim_note,
            cases.shbs_note,
            cases.shbs_confirm,
            cases.collection_date,
            cases.receive_date,
            cases.registrate_date,
            cases.schedule_date,
            cases.establish_date,
            cases.doc_send_date,
            cases.confirm_date,
            users.name,
            orgs.name as org_name,
            banks.name as bank_name,
            bank_types.name as type
        FROM
            cases
        JOIN
            orgs
            ON
            orgs.id = cases.org_id
        JOIN
            users
            ON
            users.id = cases.user_id
        JOIN
            banks
            ON
            banks.id = cases.bank_id
        JOIN
            bank_types
            ON
            bank_types.code = banks.type
        WHERE
            cases.org_id = '{org["id"]}';
        """
        cases += await db.fetch_all(sql)
    return cases


async def query_case(db: DB, id: int):
    sql = f"""
    SELECT
        cases.id,
        cases.org_id,
        cases.user_id,
        cases.exe_confirm,
        cases.shbs_report,
        cases.bank_id,
        cases.loan_target,
        cases.ap_loan_applicable,
        cases.exe_date,
        cases.house_code,
        cases.house_name,
        cases.loan_amount,
        cases.deduction_amount,
        cases.deposit_amount,
        cases.heim_note,
        cases.shbs_note,
        cases.shbs_confirm,
        cases.collection_date,
        cases.receive_date,
        cases.registrate_date,
        cases.schedule_date,
        cases.establish_date,
        cases.doc_send_date,
        cases.confirm_date
    FROM
        cases
    
    WHERE
        cases.id = '{id}';
    """

    return await db.fetch_one(sql)


async def update_case(db: DB, data: dict):
    sql = f"""
    UPDATE 
        cases
    SET
        org_id = '{data["org_id"]}',
        user_id = '{data["user_id"]}',
        exe_confirm = '{data["exe_confirm"]}',
        shbs_report = '{data["shbs_report"]}',
        bank_id = '{data["bank_id"]}',
        loan_target = '{data["loan_target"]}',
        ap_loan_applicable = '{data["ap_loan_applicable"]}',
        exe_date = '{data["exe_date"]}',
        house_code = '{data["house_code"]}',
        house_name = '{data["house_name"]}',
        loan_amount = {int(data["loan_amount"]if data["loan_amount"] else 0)},
        deduction_amount = {int(data["deduction_amount"] if data["deduction_amount"] else 0)},
        deposit_amount = {int(data["loan_amount"])-int(data["deduction_amount"] if data["deduction_amount"] else 0)},
        heim_note = '{data["heim_note"]}',
        shbs_note = '{data["shbs_note"]}',
        shbs_confirm = '{data["shbs_confirm"]}',
        collection_date = '{data["collection_date"]}',
        receive_date = '{data["receive_date"]}',
        registrate_date = '{data["registrate_date"]}',
        schedule_date = '{data["schedule_date"]}',
        establish_date = '{data["establish_date"]}',
        doc_send_date = '{data["doc_send_date"]}',
        confirm_date = '{data["confirm_date"]}'
    WHERE
        cases.id = '{data["id"]}'
    """
    sql = sql.replace("''", "null")

    await db.execute(sql)
