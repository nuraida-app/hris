import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import moment from "moment";
import "moment/locale/id"; // Pastikan locale Indonesia aktif

// Registrasi Font (Opsional, pakai Helvetica bawaan agar ringan)
// Jika ingin custom font, gunakan Font.register(...)

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  // Header Section
  headerContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    backgroundColor: "#f0f0f0", // Fallback jika tidak ada gambar
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#000",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 9,
    color: "#444",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#1890ff",
    marginBottom: 15,
  },
  // Section Titles
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#000",
    marginBottom: 8,
    marginTop: 15,
    paddingLeft: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1890ff", // Aksen Biru Modern
  },
  // Data Grid (Key-Value)
  rowKV: {
    flexDirection: "row",
    marginBottom: 3,
  },
  labelKV: {
    width: "30%",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  valueKV: {
    width: "70%",
    fontSize: 9,
  },
  // Table Styles
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f5ff",
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    padding: 5,
  },
  tableCell: {
    fontSize: 8,
  },
  // Footer
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#888",
  },
  signatureContainer: {
    marginTop: 40,
    alignItems: "flex-end",
    paddingRight: 30,
  },
  signatureText: {
    textAlign: "center",
  },
});

const CvPdfDocument = ({ data }) => {
  // --- DATA PROCESSING ---
  // Gunakan teknik spread [...] agar tidak kena error read-only saat sort
  const formalEducation = [...(data?.educations || [])]
    .filter((item) => item.level !== "Non-Formal")
    .sort((a, b) => b.graduationYear - a.graduationYear);

  const trainingHistory = [...(data?.trainings || [])].sort(
    (a, b) => b.year - a.year
  );

  const careerHistory = [...(data?.CareerHistories || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER --- */}
        <View style={styles.headerContainer}>
          {data?.profilePicture ? (
            <Image style={styles.avatar} src={data.profilePicture} />
          ) : (
            // Placeholder kotak jika tidak ada foto
            <View
              style={[
                styles.avatar,
                { justifyContent: "center", alignItems: "center" },
              ]}
            ></View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.name}>{data?.fullName}</Text>
            <Text style={styles.subHeader}>
              {data?.position?.name} - {data?.department?.name}
            </Text>
            <Text style={styles.contactInfo}>
              Email: {data?.account?.email || data?.email} | Telp:{" "}
              {data?.phone || "-"}
            </Text>
            <Text style={styles.contactInfo}>NIP: {data?.nip}</Text>
            <Text style={styles.contactInfo}>{data?.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- A. DATA PRIBADI --- */}
        <Text style={styles.sectionTitle}>A. DATA PRIBADI</Text>
        <View>
          <View style={styles.rowKV}>
            <Text style={styles.labelKV}>Tempat, Tgl Lahir</Text>
            <Text style={styles.valueKV}>
              : {data?.placeOfBirth},{" "}
              {data?.dateOfBirth
                ? moment(data.dateOfBirth).format("DD MMMM YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.rowKV}>
            <Text style={styles.labelKV}>Jenis Kelamin</Text>
            <Text style={styles.valueKV}>: {data?.gender}</Text>
          </View>
          <View style={styles.rowKV}>
            <Text style={styles.labelKV}>Status Pernikahan</Text>
            <Text style={styles.valueKV}>: {data?.maritalStatus}</Text>
          </View>
          <View style={styles.rowKV}>
            <Text style={styles.labelKV}>Agama</Text>
            <Text style={styles.valueKV}>: {data?.religion}</Text>
          </View>
          <View style={styles.rowKV}>
            <Text style={styles.labelKV}>NIK (KTP)</Text>
            <Text style={styles.valueKV}>: {data?.identityNumber}</Text>
          </View>
        </View>

        {/* --- B. PENDIDIKAN TERAKHIR --- */}
        <Text style={styles.sectionTitle}>B. PENDIDIKAN TERAKHIR</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>Jenjang</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Institusi</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>Jurusan</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>Tahun</Text>
            </View>
            <View
              style={[styles.tableCol, { width: "10%", borderRightWidth: 0 }]}
            >
              <Text style={styles.tableCell}>IPK</Text>
            </View>
          </View>
          {/* Table Body */}
          {formalEducation.length > 0 ? (
            formalEducation.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCell}>{item.level}</Text>
                </View>
                <View style={[styles.tableCol, { width: "35%" }]}>
                  <Text style={styles.tableCell}>{item.institutionName}</Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text style={styles.tableCell}>{item.major || "-"}</Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCell}>{item.graduationYear}</Text>
                </View>
                <View
                  style={[
                    styles.tableCol,
                    { width: "10%", borderRightWidth: 0 },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {item.gpa ? item.gpa.toFixed(2) : "-"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={{ padding: 5 }}>
                <Text style={styles.tableCell}>Tidak ada data pendidikan.</Text>
              </View>
            </View>
          )}
        </View>

        {/* --- C. RIWAYAT JABATAN --- */}
        <Text style={styles.sectionTitle}>C. RIWAYAT JABATAN</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Jabatan</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Departemen</Text>
            </View>
            <View
              style={[styles.tableCol, { width: "30%", borderRightWidth: 0 }]}
            >
              <Text style={styles.tableCell}>Periode</Text>
            </View>
          </View>
          {careerHistory.length > 0 ? (
            careerHistory.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: "35%" }]}>
                  <Text style={styles.tableCell}>{item.Position?.name}</Text>
                  <Text
                    style={[styles.tableCell, { color: "#666", fontSize: 7 }]}
                  >
                    {item.type}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "35%" }]}>
                  <Text style={styles.tableCell}>{item.Department?.name}</Text>
                </View>
                <View
                  style={[
                    styles.tableCol,
                    { width: "30%", borderRightWidth: 0 },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {moment(item.startDate).format("MMM YYYY")} -{" "}
                    {item.endDate
                      ? moment(item.endDate).format("MMM YYYY")
                      : "Sekarang"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={{ padding: 5 }}>
                <Text style={styles.tableCell}>Belum ada riwayat jabatan.</Text>
              </View>
            </View>
          )}
        </View>

        {/* --- D. PELATIHAN / SERTIFIKASI --- */}
        <Text style={styles.sectionTitle}>D. PELATIHAN / SERTIFIKASI</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "30%" }]}>
              <Text style={styles.tableCell}>Nama Pelatihan</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={styles.tableCell}>Penyelenggara</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text style={styles.tableCell}>Tahun</Text>
            </View>
            <View
              style={[styles.tableCol, { width: "30%", borderRightWidth: 0 }]}
            >
              <Text style={styles.tableCell}>Keterangan</Text>
            </View>
          </View>
          {trainingHistory.length > 0 ? (
            trainingHistory.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: "30%" }]}>
                  <Text style={styles.tableCell}>{item.trainingName}</Text>
                  {item.certificateNo && (
                    <Text
                      style={[styles.tableCell, { fontSize: 7, color: "#666" }]}
                    >
                      No: {item.certificateNo}
                    </Text>
                  )}
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text style={styles.tableCell}>{item.organizer}</Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCell}>{item.year}</Text>
                </View>
                <View
                  style={[
                    styles.tableCol,
                    { width: "30%", borderRightWidth: 0 },
                  ]}
                >
                  <Text style={styles.tableCell}>{item.notes || "-"}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={{ padding: 5 }}>
                <Text style={styles.tableCell}>Tidak ada data pelatihan.</Text>
              </View>
            </View>
          )}
        </View>

        {/* --- FOOTER & SIGNATURE --- */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>
            Bogor, {moment().format("DD MMMM YYYY")}
          </Text>
          <Text style={[styles.signatureText, { marginBottom: 40 }]}>
            Hormat Saya,
          </Text>
          {/* Space Tanda Tangan */}
          <Text
            style={[
              styles.signatureText,
              { fontFamily: "Helvetica-Bold", textDecoration: "underline" },
            ]}
          >
            {data?.fullName}
          </Text>
          <Text style={styles.signatureText}>NIP. {data?.nip}</Text>
        </View>

        <Text style={styles.footer}>
          Dokumen ini digenerate secara otomatis oleh Sistem HRIS Nuraida
          Islamic Boarding School
        </Text>
      </Page>
    </Document>
  );
};

export default CvPdfDocument;
