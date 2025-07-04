// const pdfParse = require('pdf-parse');
// const textract = require('textract');
// const { extractSkills, extractExperience } = require('../utils/parserHelpers');
// const mongoose = require('mongoose');

// const ResumeSchema = new mongoose.Schema({
//   firstName: String,
//   middleName: String,
//   lastName: String,
//   email: String,
//   phone: String,
//   skills: [String],
//   experience: String,
//   education: String,
//   fileUrl: String
// });

// const Resume = mongoose.model('Resume', ResumeSchema);

// class ResumeModel {
//   static async extractText(file) {
//     try {
//       if (file.mimetype === 'application/pdf') {
//         const data = await pdfParse(file.buffer);
//         return data.text;
//       } else {
//         return new Promise((resolve, reject) => {
//           textract.fromBufferWithName(file.originalname, file.buffer, (err, text) => {
//             if (err) return reject(err);
//             resolve(text);
//           });
//         });
//       }
//     } catch (err) {
//       console.error('Extraction error:', err);
//       throw new Error('Failed to extract text from file');
//     }
//   }

//   static async parseAndSave(file) {
//     try {
//       const text = await this.extractText(file);
//       console.log('Extracted text:', text.substring(0, 200));

//       const { firstName, middleName, lastName } = this.extractName(text);

//       const parsedData = {
//         firstName,
//         middleName,
//         lastName,
//         email: this.extractEmail(text),
//         phone: this.extractPhone(text),
//         skills: extractSkills(text).split(', '),
//         experience: extractExperience(text),
//         education: this.extractEducation(text),
//         fileUrl: `/uploads/${file.originalname}`
//       };

//       if (!parsedData.email) throw new Error('No email found in resume');

//       const resume = new Resume(parsedData);
//       return await resume.save();
//     } catch (err) {
//       console.error('Parse error:', err);
//       throw err;
//     }
//   }

//   static extractName(text) {
//     const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
//     const email = this.extractEmail(text);
//     const emailLineIndex = lines.findIndex(line => line.includes(email));
  
//     let fullName = '';
//     if (emailLineIndex > 0) {
//       const possibleName = lines[emailLineIndex - 1].replace(/\t+/g, ' ').trim();
//       const nameMatch = possibleName.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/);
//       if (nameMatch) {
//         fullName = nameMatch[0];
//       }
//     }
  
//     if (!fullName) {
//       fullName = lines[0].replace(/\t+/g, ' ').trim();
//     }
  
//     const nameParts = fullName.split(' ');
//     const firstName = nameParts[0] || '';
//     const middleName = nameParts.length === 3 ? nameParts[1] : '';
//     const lastName = nameParts[nameParts.length - 1] || '';
  
//     return { firstName, middleName, lastName };
//   }
  
  
  
//   static extractEmail(text) {
//     const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
//     return emailMatch ? emailMatch[0] : '';
//   }
  

//   static extractPhone(text) {
//     const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
//     return phoneMatch ? phoneMatch[0] : '';
//   }

//   static extractExperience(text) {
//     const match = text.match(/(\d{1,2})\s*\+?\s*(years|yrs)/i);
//     return match ? `${match[1]} years` : '';
//   }
  

//   static extractEducation(text) {
//     const match = text.match(/(B\.?Tech|M\.?Tech|Bachelor|Master|BSc|MSc|BE)[^\n]*/i);
//     return match ? match[0] : '';
//   }
// }

// ResumeModel.model = Resume;
// module.exports = ResumeModel;


//----new for resume fix

const pdfParse = require('pdf-parse');
const textract = require('textract');
const { extractSkills, extractExperience } = require('../utils/parserHelpers');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../middleware/upload');

const ResumeSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  skills: [String],
  experience: String,
  education: String,
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Resume = mongoose.model('Resume', ResumeSchema);

class ResumeModel {
  static async extractText(file) {
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        return data.text;
      } else {
        return new Promise((resolve, reject) => {
          textract.fromBufferWithName(file.originalname, file.buffer, (err, text) => {
            if (err) return reject(err);
            resolve(text);
          });
        });
      }
    } catch (err) {
      console.error('Extraction error:', err);
      throw new Error('Failed to extract text from file');
    }
  }

  static async parseAndSave(file) {
    try {
      const text = await this.extractText(file);
      console.log('Extracted text:', text.substring(0, 200));

      const { firstName, middleName, lastName } = this.extractName(text);

      const parsedData = {
        firstName,
        middleName,
        lastName,
        email: this.extractEmail(text),
        phone: this.extractPhone(text),
        skills: extractSkills(text).split(', '),
        experience: extractExperience(text),
        education: this.extractEducation(text),
        filePath: path.join(uploadDir, file.filename),
        originalName: file.originalname
      };

      if (!parsedData.email) throw new Error('No email found in resume');

      const resume = new Resume(parsedData);
      return await resume.save();
    } catch (err) {
      // Clean up uploaded file if parsing fails
      if (file && file.path) {
        fs.unlink(file.path, () => {});
      }
      console.error('Parse error:', err);
      throw err;
    }
  }

    static extractName(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const email = this.extractEmail(text);
    const emailLineIndex = lines.findIndex(line => line.includes(email));
  
    let fullName = '';
    if (emailLineIndex > 0) {
      const possibleName = lines[emailLineIndex - 1].replace(/\t+/g, ' ').trim();
      const nameMatch = possibleName.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/);
      if (nameMatch) {
        fullName = nameMatch[0];
      }
    }
  
    if (!fullName) {
      fullName = lines[0].replace(/\t+/g, ' ').trim();
    }
  
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const middleName = nameParts.length === 3 ? nameParts[1] : '';
    const lastName = nameParts[nameParts.length - 1] || '';
  
    return { firstName, middleName, lastName };
  }
  
  
  
  static extractEmail(text) {
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    return emailMatch ? emailMatch[0] : '';
  }
  

  static extractPhone(text) {
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return phoneMatch ? phoneMatch[0] : '';
  }

  static extractExperience(text) {
    const match = text.match(/(\d{1,2})\s*\+?\s*(years|yrs)/i);
    return match ? `${match[1]} years` : '';
  }
  

  static extractEducation(text) {
    const match = text.match(/(B\.?Tech|M\.?Tech|Bachelor|Master|BSc|MSc|BE)[^\n]*/i);
    return match ? match[0] : '';
  }
}



ResumeModel.model = Resume;
module.exports = ResumeModel;