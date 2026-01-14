# Sample Google Sheets Data Template

## Instructions
Copy paste data di bawah ini ke Google Sheets Anda sesuai dengan sheet masing-masing.

---

## Sheet: Users

**Headers (Row 1):**
```
id | email | password | name | phone | membership_type | membership_status | registered_date | profile_picture | total_credits | gender | date_of_birth
```

**Sample Data (Row 2+):**
```
1143	stella@example.com	$2a$10$XZmL9Zp7wYxQ8.kL5qL3ZOj8Zp7wYxQ8	Stellaa	+62812345001	Regular	Active	2025-01-15	u-1143.webp	10	F	1990-05-15
75	anne@example.com	$2a$10$XZmL9Zp7wYxQ8.kL5qL3ZOj8Zp7wYxQ8	Anne	+62812345002	Premium	Active	2024-11-20	u-75.webp	20	F	1988-03-22
141	cecillia@example.com	$2a$10$XZmL9Zp7wYxQ8.kL5qL3ZOj8Zp7wYxQ8	Cecillia Kurniawaty	+62812345003	Regular	Active	2024-12-05	u-141.webp	15	F	1992-07-18
```

---

## Sheet: Trainers

**Headers (Row 1):**
```
id | name | email | phone | specialization | image | bio | status | joined_date
```

**Sample Data (Row 2+):**
```
3	Kim Davis	kim@pilatestudio.com	+62812340001	Reformer, Wall Board, Chair	u-3.webp	Certified Pilates instructor with 10+ years experience	Active	2024-01-10
5	Shanti	shanti@pilatestudio.com	+62812340002	Reformer, Wall Board	u-5.webp	Expert in intermediate and advanced Pilates	Active	2024-02-15
7	Monica Theresia	monica@pilatestudio.com	+62812340003	Reformer	u-7.webp	Specializes in beginner and intermediate classes	Active	2024-03-20
8	Amelia Venesa	amelia@pilatestudio.com	+62812340004	Reformer, Wall Board	u-8.webp	Passionate about helping clients reach their fitness goals	Active	2024-04-10
902	Caitlyn	caitlyn@pilatestudio.com	+62812340005	Reformer	u-902.webp	Beginner-friendly instructor with warm teaching style	Active	2024-05-05
156	Stephani Karnadi	stephani@pilatestudio.com	+62812340006	Yoga	u-156.webp	Certified Vinyasa Yoga instructor	Active	2024-06-01
```

---

## Sheet: Classes

**Headers (Row 1):**
```
id | name | duration | capacity | description | price | credits_required | status
```

**Sample Data (Row 2+):**
```
9	Reguler	60	6	Regular Pilates class for all levels (Basic to Advanced)	150000	1	Active
10	Happy Hour	60	6	Discounted Pilates class during off-peak hours	100000	1	Active
12	Yoga	60	12	Vinyasa Yoga class for flexibility and mindfulness	120000	1	Active
```

---

## Sheet: Schedules

**Headers (Row 1):**
```
id | schedule_time | trainer_id | class_id | members | gender_restriction | all_day | notes | booking_id | flag | created_user | created_pid | created_time | modified_user | modified_pid | modified_time | status
```

**Sample Data for 2025-12-19 (Row 2+):**
```
11345	2025-12-19 07:00:00	3	9	["75","141"]	F	0	Reformer \n(Basic/Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:43:48	ERIKA0109	controller\api\adminservice::savecontent	2025-12-18 16:01:51	Active
11346	2025-12-19 08:00:00	5	9	[]	F	0	Wall Board \n(Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:44:11	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:44:11	Active
11347	2025-12-19 08:00:00	902	10	["1682","2383","1960","2374","2395","838"]	F	0	Reformer \n(Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:44:29	VANIAAURELLIA2701	controller\api\scheduleservice::bookapply	2025-12-18 16:57:31	Active
11348	2025-12-19 09:00:00	7	10	["1471","2154","2153","495"]	F	0	Reformer \n(Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:44:49	MILLATINALFAFA2008	controller\api\scheduleservice::bookapply	2025-12-19 09:00:03	Active
11350	2025-12-19 10:00:00	8	10	["2296","2227","2317","2318","1980","36"]	F	0	Reformer \n(Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:45:23	FELICIAKODIAT0602	controller\api\scheduleservice::bookapply	2025-12-17 20:54:44	Active
11351	2025-12-19 16:00:00	7	10	["1041","1312","1042","2385","2389"]	F	0	Reformer \n(Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:45:59	MOZAASRI1210	controller\api\scheduleservice::bookapply	2025-12-19 12:45:14	Active
11353	2025-12-19 17:00:00	3	9	["2232","943","1508","1143","324","2022"]		0	Reformer \n(Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:47:24	RAISSAPUTRI2503	controller\api\scheduleservice::bookapply	2025-12-19 09:53:53	Active
11354	2025-12-19 17:00:00	8	10	["2251","328"]		0	Wall Board \n(Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:47:52	ERIKA0109	controller\api\adminservice::savecontent	2025-12-19 15:22:09	Active
11355	2025-12-19 18:00:00	3	9	["2014","1915","1177","1175","2246","2250"]		0	Reformer \n(Basic/Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:48:21	JULIANAKUSUMO2308	controller\api\scheduleservice::bookapply	2025-12-18 22:23:32	Active
```

**Sample Data for 2025-12-20 (Row 11+):**
```
11356	2025-12-20 07:00:00	156	12	["75","56"]	F	0	Vinyasa Yoga	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:48:40	ERIKA0109	controller\api\adminservice::savecontent	2025-12-19 15:00:58	Active
11357	2025-12-20 08:00:00	8	10	[]	F	0	Reformer \n(Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:49:06	ERIKA0109	controller\api\adminservice::savecontent	2025-12-12 08:21:13	Active
11358	2025-12-20 09:00:00	902	10	["2240","1211","2192","2191","2114","2401"]	F	0	Reformer \n(Beginner)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:49:32	WINDIRIANTI3003	controller\api\scheduleservice::bookapply	2025-12-17 14:40:52	Active
11360	2025-12-20 10:00:00	902	10	["2084","790","2406"]	F	0	Reformer \n(Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:50:31	JESSLYNKALONICA0806	controller\api\scheduleservice::bookapply	2025-12-19 13:31:47	Active
11361	2025-12-20 16:00:00	3	9	["2015","2390","2386","886","693"]		0	Reformer \n(Basic/Intermediate)	0	0	ERIKA0109	controller\api\adminservice::savecontent	2025-12-10 16:50:53	SHEIRLA0202	controller\api\scheduleservice::bookapply	2025-12-19 13:30:20	Active
```

---

## Sheet: Bookings

**Headers (Row 1):**
```
id | schedule_id | user_id | booking_time | status | attended | cancelled_time | notes | payment_status | credits_used
```

**Sample Data (Row 2+):**
```
1	11353	1143	2025-12-19 09:53:53	Confirmed	0			Paid	1
2	10868	1143	2025-11-19 15:00:00	Completed	1			Paid	1
3	10872	1143	2025-11-20 10:30:00	Completed	1			Paid	1
4	11003	1143	2025-11-26 14:20:00	Completed	1			Paid	1
5	11017	1143	2025-11-27 16:45:00	Completed	1			Paid	1
6	11213	1143	2025-12-08 13:10:00	Completed	1			Paid	1
7	11234	1143	2025-12-10 11:25:00	Completed	1			Paid	1
8	11238	1143	2025-12-11 09:40:00	Completed	1			Paid	1
```

---

## Sheet: Transactions

**Headers (Row 1):**
```
id | user_id | transaction_time | amount | credits_purchased | payment_method | payment_status | invoice_number
```

**Sample Data (Row 2+):**
```
1	1143	2025-01-15 10:30:00	500000	5	Transfer Bank	Paid	INV-2025-001
2	75	2024-11-20 14:20:00	1000000	10	Transfer Bank	Paid	INV-2025-002
3	141	2024-12-05 16:15:00	750000	8	Transfer Bank	Paid	INV-2025-003
```

---

## Quick Setup Script

Jika ingin setup lebih cepat, jalankan script ini di Google Apps Script:

```javascript
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheets
  const sheets = ['Users', 'Trainers', 'Classes', 'Schedules', 'Bookings', 'Transactions'];
  sheets.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
  });
  
  Logger.log('Database sheets created successfully!');
}
```

---

## Notes

1. **Members Field**: Harus dalam format JSON string: `["id1","id2"]` bukan array biasa
2. **Date Format**: Gunakan format `YYYY-MM-DD HH:MM:SS` untuk konsistensi
3. **Empty Array**: Gunakan `[]` bukan `""` untuk empty members
4. **Gender Restriction**: `F` = Female only, `M` = Male only, kosong = All
5. **Status**: Pastikan status `Active` untuk schedule yang visible

---

## Verification Checklist

- [ ] All 6 sheets created
- [ ] Headers match exactly (case-sensitive)
- [ ] Sample data populated
- [ ] JSON strings properly formatted
- [ ] Date formats consistent
- [ ] Spreadsheet shared with service account
- [ ] GOOGLE_SHEETS_ID updated in .env
