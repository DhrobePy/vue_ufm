-- Minimal fixtures for scripts/rule-tests.mjs (load into an EMPTY scratch database that already has the app's schema).
insert into users (id,display_name,email,password_hash,role) values
 (1,'Super','super@t','x','Superadmin'),(2,'Acct','acct@t','x','Accounts'),(3,'Sales','sales@t','x','sales-srg'),
 (4,'Disp','disp@t','x','dispatch-srg'),(5,'Prod','prod@t','x','production manager-srg'),(6,'Staff','staff@t','x','Staff'),(7,'Admin2','admin@t','x','admin'),(9,'AcctDemra','ad@t','x','accounts-demra');
insert into branches (id,name,code,status) values (1,'Sirajgonj','SRG','active'),(2,'Demra','DEMRA','active');
insert into customers (id,name,phone_number,credit_limit,status,customer_type) values (1,'Test Customer','01700000001',100000,'active','Credit');
insert into products (id,base_name,status) values (1,'Flour','active');
insert into product_variants (id,product_id,sku,weight_variant,grade,status) values (1,1,'FL-50A','50 KG','A','active');
insert into product_prices (variant_id,branch_id,unit_price,effective_date,is_active) values (1,1,1000,curdate(),1);
insert into chart_of_accounts (id,account_type,normal_balance,name) values (1,'Accounts Receivable','Debit','Accounts Receivable'),(2,'Revenue','Credit','Revenue');
