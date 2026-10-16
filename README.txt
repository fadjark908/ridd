DOMPETKU — Starter aplikasi pencatat keuangan

CARA MENJALANKAN
1. Ekstrak ZIP ini.
2. Buka folder dompet-pribadi di VS Code.
3. Jika memakai ekstensi Live Server, klik kanan index.html > Open with Live Server.
   Alternatif: klik dua kali index.html untuk membukanya di browser.
4. Tambah transaksi pemasukan/pengeluaran dan atur anggaran bulanan.
5. Tombol Ekspor mengunduh CSV yang bisa dibuka di Microsoft Excel.

FITUR VERSI AWAL
- Rekap hari ini, minggu ini (Senin–Minggu), dan bulan ini.
- Saldo total dari seluruh pemasukan dikurangi seluruh pengeluaran.
- Kartu khusus pengeluaran hari ini.
- Anggaran bulanan dan sisa anggaran.
- Grafik sederhana berdasarkan periode.
- Tambah dan hapus transaksi.
- Ekspor laporan CSV berformat kompatibel dengan Excel.

PENTING
- Data versi ini tersimpan di LocalStorage browser/perangkat ini.
- Data belum sinkron ke perangkat lain, belum ada login, dan belum menjadi APK.
- Jangan menghapus data browser sebelum membuat cadangan CSV.
- Langkah berikutnya adalah menghubungkan Firebase Authentication + Firestore,
  mengatur aturan keamanan database, lalu mengemas aplikasi dengan Capacitor dan Android Studio.

Versi 3: Logo dompet khusus, tanggal dan jam transaksi tercatat otomatis saat tombol simpan ditekan, jam ditampilkan di riwayat dan ekspor. Rekap harian, mingguan, bulanan tetap tersedia.
