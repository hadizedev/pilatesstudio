# Quick Start Guide - Homepage Google Sheets Integration

## 🚀 Langkah Cepat Setup

### 1. Buat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat Spreadsheet baru dengan nama: **Pilate Studio - Homepage Settings**

### 2. Buat 9 Sheets dengan Nama Berikut:

- Banner
- About
- Teachers
- Testimonials
- Classes
- Contact
- FAQ
- Colors
- SectionSettings

### 3. Copy Data Sample ke Setiap Sheet

#### Sheet 1: Banner
Copy paste data ini ke sheet Banner (row 1 = header):

```
id	title_line1	title_line2	subtitle	tagline	background_image	overlay_opacity	instagram_url	location_url	whatsapp_number	whatsapp_text
1	The heaven of	PILATES	Restructure your body and mind	Established since 2015	https://homepilatesstudio.com/uploads/website/home-banner.webp	0.5	https://www.instagram.com/home_pilates_studio	https://maps.app.goo.gl/8V99Pyg82etrUswj9	6287822282068	Chat with Admin
```

#### Sheet 2: About
```
id	title	title_highlight	title_color	title_color_highlight	subtitle	logo_image	reason_1	reason_2	reason_3	reason_4
1	About Home Pilates Studio	About	#514f34	#a05a3f	Reason Why You Need Us	/images/logo.png	Need help on back ache and perfect body posture?	Want to get better balance and strenth of your body core	Want to try how to refresh the mind and better body composition?	Trained by certified trainers
```

#### Sheet 3: Teachers
```
id	name	position	image_url	order	active
1	LEE CHING CHING	Head Teacher	https://homepilatesstudio.com/uploads/users/u-2.webp	1	TRUE
2	KIM DAVIS	Expert Teacher - Masterclass	https://homepilatesstudio.com/uploads/users/u-3.webp	2	TRUE
3	SHANTI	Expert Teacher - Masterclass	https://homepilatesstudio.com/uploads/users/u-5.webp	3	TRUE
```

#### Sheet 4: Testimonials
```
id	client_name	rating	testimonial	order	active
1	Ellie Damayanti	5	Tempat pilates yg homey bangettt, suasananya tenang, bersih, alat2 lengkap dan pelatihnya mantab2. Ga salah deh pilih pilates disini 👍👍👍👍	1	TRUE
2	Tiara Aprilia	5	Tempat sangat nyaman, alat2 pilates lengkap dari reformer, wallboard, chair dll. Instruktur juga sangat membantu, beginner sampai ke intermediate semua bisa ikut. Highly recommended	2	TRUE
3	Giovanni	5	Very nice place to workout supported by helpful and humble coaches! Experts in their area. Recommended for everyone!	3	TRUE
```

#### Sheet 5: Classes
```
id	class_name	description	image_url	anchor_link	order	active
1	Reformer Class	A machine with a sliding platform and springs	https://homepilatesstudio.com/uploads/website/slider-reformer.webp	reformer	1	TRUE
2	Wunda Chair Class	Chair with attach pedal with spring	https://homepilatesstudio.com/uploads/website/slider-wundachair.webp	wundachair	2	TRUE
3	Wallboard Class	A wall-mounted plywood board with springs, handles, foot straps, and a rollback bar	https://homepilatesstudio.com/uploads/website/slider-wallboard.webp	wallboard	3	TRUE
4	Therapy Program Class	Correcting the Curvature of the Spine	https://homepilatesstudio.com/uploads/website/slider-scolio.webp	scolio	4	TRUE
5	Yoga Class	Postures and breathing exercises to promote calm and mindfulness	https://homepilatesstudio.com/uploads/website/slider-yoga.webp	yoga	5	TRUE
```

#### Sheet 6: Contact
```
id	address	phone	mon_fri_hours	sat_hours	sun_hours	map_embed_url	whatsapp_number
1	Jl. Kuta Kencana Tim. Jl. Singgasana Raya No.2, Mekarwangi, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40236	0878-2228-2068	07.00 - 19.00	07.00 - 11.00	Closed	https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3960.445005251872!2d107.59676825982162!3d-6.956717289799492!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e8e9becde3fb%3A0xae0b0b0257be584!2sHome%20Pilates%20Studio!5e0!3m2!1sen!2sid!4v1731683539835!5m2!1sen!2sid	6281393339939
```

#### Sheet 7: FAQ
```
id	question	answer	order	active
1	What is Pilates?	Pilates is a form of low-impact exercise that aims to strengthen muscles while improving postural alignment and flexibility.	1	TRUE
2	Do I need to bring my own equipment?	No, all equipment is provided at our studio. We have a wide range of Pilates equipment for all types of classes.	2	TRUE
3	Is Pilates suitable for beginners?	Yes, we offer classes for all levels, including beginners. Our instructors are trained to modify exercises to suit individual needs.	3	TRUE
4	What should I wear to class?	Comfortable workout clothes that allow for movement are recommended. Avoid loose clothing that might get caught in equipment.	4	TRUE
```

#### Sheet 8: Colors
```
section_name	primary_color	secondary_color	background_color	text_color
banner	#514f34	#a05a3f	#000000	#ffffff
about	#514f34	#a05a3f	#ffffff	#333333
testimonials	#514f34	#a05a3f	#F0E9D6	#333333
classes	#514f34	#a05a3f	#ffffff	#333333
contact	#514f34	#a05a3f	#ffffff	#333333
```

#### Sheet 9: SectionSettings
```
section_name	title	subtitle	active	order
banner	Welcome	Transform Your Life	TRUE	1
about	About Us	Why Choose Us	TRUE	2
teachers	Our Teacher	Enjoy the ultimate class experience from highly experienced certified teachers!	TRUE	3
testimonials	What Our Client Says About Us	How our class change them	TRUE	4
classes	Our Classes	Transform Your Body and Mind with Expert Guidance	TRUE	5
contact	Contacts		TRUE	6
faq	FAQ	Frequently Asked Questions	TRUE	7
```

### 4. Share Spreadsheet dengan Service Account

1. Klik tombol **Share** di kanan atas
2. Masukkan email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
3. Berikan akses **Editor** atau minimal **Viewer**
4. Klik **Send**

### 5. Copy Spreadsheet ID

Dari URL spreadsheet:
```
https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑
                                        Spreadsheet ID
```

### 6. Update Spreadsheet ID di Code

Edit file `utils/googleSheets.js` baris 12:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID yang dicopy
```

Atau tambahkan di `.env`:
```env
HOMEPAGE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### 7. Test API

Jalankan server:
```bash
npm run dev
```

Test di browser:
```
http://localhost:3001/api/homepage
```

### 8. Lihat Homepage

Buka homepage:
```
http://localhost:3001/
```

## ✅ Checklist Setup

- [ ] Buat Google Spreadsheet baru
- [ ] Buat 9 sheets (Banner, About, Teachers, Testimonials, Classes, Contact, FAQ, Colors, SectionSettings)
- [ ] Copy data sample ke setiap sheet
- [ ] Share dengan service account email
- [ ] Copy Spreadsheet ID dari URL
- [ ] Update SPREADSHEET_ID di utils/googleSheets.js
- [ ] Jalankan `npm run dev`
- [ ] Test API: http://localhost:3001/api/homepage
- [ ] Buka homepage: http://localhost:3001/

## 🎯 Tips

- **Testing**: Ubah data di Google Sheets, refresh browser untuk lihat perubahan
- **Active Field**: Set `FALSE` untuk hide item tanpa delete
- **Order Field**: Ubah angka untuk mengatur urutan tampilan
- **Colors**: Gunakan format hex (#RRGGBB)
- **URLs**: Pastikan URL lengkap dengan http:// atau https://

## 📝 Dokumentasi Lengkap

Lihat [HOMEPAGE_SHEETS_SETUP.md](HOMEPAGE_SHEETS_SETUP.md) untuk dokumentasi lengkap struktur database.

---

**Need Help?** Check console log untuk error messages dan pastikan semua sheets sudah dibuat dengan nama yang exact.
