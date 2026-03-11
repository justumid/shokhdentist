"""
PDF Generator for Patient Questionnaires
Generates detailed PDFs with patient and appointment information
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from io import BytesIO
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("shokhdentist")


class QuestionnaireGenerator:
    """Generate patient questionnaire PDFs"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Setup custom styles for the PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#1976d2'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Heading style
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1976d2'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Section style
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#424242'),
            spaceAfter=10,
            spaceBefore=8,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=colors.HexColor('#e0e0e0'),
            borderPadding=5,
            backColor=colors.HexColor('#f5f5f5')
        ))
        
        # Label style
        self.styles.add(ParagraphStyle(
            name='Label',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#666666'),
            fontName='Helvetica-Bold'
        ))
        
        # Value style
        self.styles.add(ParagraphStyle(
            name='Value',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#212121'),
            fontName='Helvetica'
        ))
    
    def generate_questionnaire(self, appointment: Dict[str, Any], patient: Dict[str, Any]) -> BytesIO:
        """
        Generate a comprehensive patient questionnaire PDF
        
        Args:
            appointment: Appointment data
            patient: Patient data
            
        Returns:
            BytesIO: PDF file in memory
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Build the PDF content
        story = []
        
        # Header
        story.append(Paragraph("SHOKH DENTIST", self.styles['CustomTitle']))
        story.append(Paragraph("Bemor Anketasi / Patient Questionnaire", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.5*cm))
        
        # Appointment Information Section
        story.append(Paragraph("📅 QABULGA YOZILISH MA'LUMOTLARI", self.styles['SectionTitle']))
        story.append(Spacer(1, 0.3*cm))
        
        appointment_data = [
            ['Qabul raqami:', appointment.get('id', 'N/A')],
            ['Sana:', appointment.get('date', 'N/A')],
            ['Vaqt:', appointment.get('time', 'N/A')],
            ['Qabul turi:', self._get_appointment_type_uz(appointment.get('type', 'consultation'))],
            ['Status:', self._get_status_uz(appointment.get('status', 'pending'))],
            ['Yaratilgan:', self._format_datetime(appointment.get('createdAt', ''))],
        ]
        
        if appointment.get('doctorName'):
            appointment_data.append(['Shifokor:', appointment.get('doctorName', 'N/A')])
        
        if appointment.get('service'):
            appointment_data.append(['Xizmat:', appointment.get('service', 'N/A')])
        
        story.append(self._create_info_table(appointment_data))
        story.append(Spacer(1, 0.5*cm))
        
        # Patient Information Section
        story.append(Paragraph("👤 BEMOR MA'LUMOTLARI", self.styles['SectionTitle']))
        story.append(Spacer(1, 0.3*cm))
        
        patient_data = [
            ['F.I.SH:', patient.get('fullName', 'N/A')],
            ['Telefon:', patient.get('phone', 'N/A')],
            ['Tug\'ilgan yili:', str(patient.get('birthYear', 'N/A'))],
            ['Jinsi:', self._get_gender_uz(patient.get('gender', ''))],
        ]
        
        if patient.get('email'):
            patient_data.append(['Email:', patient.get('email', '')])
        
        story.append(self._create_info_table(patient_data))
        story.append(Spacer(1, 0.5*cm))
        
        # Medical History Section
        story.append(Paragraph("🏥 TIBBIY TARIX", self.styles['SectionTitle']))
        story.append(Spacer(1, 0.3*cm))
        
        medical_data = []
        
        # Complaints
        complaints = patient.get('complaints', [])
        if complaints:
            complaints_text = ', '.join(complaints) if isinstance(complaints, list) else str(complaints)
            medical_data.append(['Shikoyatlar:', complaints_text])
        else:
            medical_data.append(['Shikoyatlar:', 'Yo\'q'])
        
        # Previous treatments
        prev_treatments = patient.get('previousTreatments', [])
        if prev_treatments:
            treatments_text = ', '.join(prev_treatments) if isinstance(prev_treatments, list) else str(prev_treatments)
            medical_data.append(['Oldingi davolanishlar:', treatments_text])
        else:
            medical_data.append(['Oldingi davolanishlar:', 'Yo\'q'])
        
        # Allergies
        allergies = patient.get('allergies', [])
        if allergies:
            allergies_text = ', '.join(allergies) if isinstance(allergies, list) else str(allergies)
            medical_data.append(['Allergiyalar:', allergies_text])
        else:
            medical_data.append(['Allergiyalar:', 'Yo\'q'])
        
        # Chronic diseases
        chronic = patient.get('chronicDiseases', [])
        if chronic:
            chronic_text = ', '.join(chronic) if isinstance(chronic, list) else str(chronic)
            medical_data.append(['Surunkali kasalliklar:', chronic_text])
        else:
            medical_data.append(['Surunkali kasalliklar:', 'Yo\'q'])
        
        # Current medications
        medications = patient.get('currentMedications', [])
        if medications:
            meds_text = ', '.join(medications) if isinstance(medications, list) else str(medications)
            medical_data.append(['Hozirgi dori-darmonlar:', meds_text])
        else:
            medical_data.append(['Hozirgi dori-darmonlar:', 'Yo\'q'])
        
        story.append(self._create_info_table(medical_data))
        story.append(Spacer(1, 0.5*cm))
        
        # Programme Information (if applicable)
        if patient.get('isProgrammeParticipant'):
            story.append(Paragraph("🎯 CHEGIRMALI DASTUR", self.styles['SectionTitle']))
            story.append(Spacer(1, 0.3*cm))
            
            programme_data = [
                ['Dastur ishtirokchisi:', 'Ha'],
                ['Qo\'llanilgan chegirma:', f"{patient.get('discountApplied', 0)}%"],
            ]
            
            if patient.get('programmeStartDate'):
                programme_data.append(['Boshlangan sana:', self._format_date(patient.get('programmeStartDate', ''))])
            
            story.append(self._create_info_table(programme_data))
            story.append(Spacer(1, 0.5*cm))
        
        # Additional Notes
        if appointment.get('notes') or patient.get('additionalInfo'):
            story.append(Paragraph("📝 QO'SHIMCHA MA'LUMOTLAR", self.styles['SectionTitle']))
            story.append(Spacer(1, 0.3*cm))
            
            notes_data = []
            if appointment.get('notes'):
                notes_data.append(['Qabul haqida:', appointment.get('notes', '')])
            if patient.get('additionalInfo'):
                notes_data.append(['Bemor haqida:', patient.get('additionalInfo', '')])
            
            story.append(self._create_info_table(notes_data))
            story.append(Spacer(1, 0.5*cm))
        
        # Footer
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("─" * 80, self.styles['Normal']))
        story.append(Spacer(1, 0.3*cm))
        
        footer_text = f"""
        <para align=center>
        <b>SHOKH DENTIST</b><br/>
        Telefon: +998 XX XXX XX XX | Email: info@shokhdentist.uz<br/>
        Manzil: Toshkent, O'zbekiston<br/>
        Ishlab chiqarilgan sana: {datetime.now().strftime('%d.%m.%Y %H:%M')}<br/>
        Ushbu hujjat avtomatik tarzda yaratilgan
        </para>
        """
        story.append(Paragraph(footer_text, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        logger.info(f"Generated questionnaire PDF for appointment {appointment.get('id', 'N/A')}")
        return buffer
    
    def _create_info_table(self, data: list) -> Table:
        """Create a formatted table for information display"""
        table = Table(data, colWidths=[6*cm, 11*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#212121')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#fafafa')])
        ]))
        return table
    
    def _get_appointment_type_uz(self, type_en: str) -> str:
        """Convert appointment type to Uzbek"""
        types = {
            'consultation': 'Bepul konsultatsiya',
            'checkup': 'Profilaktik ko\'rik',
            'treatment': 'Davolash',
            'emergency': 'Shoshilinch yordam',
            'followup': 'Takroriy ko\'rik'
        }
        return types.get(type_en, type_en)
    
    def _get_status_uz(self, status: str) -> str:
        """Convert status to Uzbek"""
        statuses = {
            'pending': '⏳ Kutilmoqda',
            'confirmed': '✅ Tasdiqlangan',
            'completed': '✓ Bajarilgan',
            'cancelled': '❌ Bekor qilingan',
            'no_show': '❓ Kelmagan'
        }
        return statuses.get(status, status)
    
    def _get_gender_uz(self, gender: str) -> str:
        """Convert gender to Uzbek"""
        genders = {
            'male': 'Erkak',
            'female': 'Ayol',
            'other': 'Boshqa'
        }
        return genders.get(gender, 'Noma\'lum')
    
    def _format_datetime(self, dt_str: str) -> str:
        """Format datetime string"""
        if not dt_str:
            return 'N/A'
        try:
            dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            return dt.strftime('%d.%m.%Y %H:%M')
        except:
            return dt_str
    
    def _format_date(self, date_str: str) -> str:
        """Format date string"""
        if not date_str:
            return 'N/A'
        try:
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime('%d.%m.%Y')
        except:
            return date_str


# Singleton instance
questionnaire_generator = QuestionnaireGenerator()
