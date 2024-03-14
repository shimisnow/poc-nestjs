/**
 * Legal doc type at the format [COUNTRY CODE]-[DOC TYPE].
 * Example: BRA_RG to a Brazil doc.
 * Country code should follow ISO_3166-1_alpha-3.
 * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
 */
export enum LegalDocTypeEnum {
  BRA_RG = 'BRA-RG',
  BRA_CNH = 'BRA-CNH',
  USA_SSN = 'USA-SSN',
}
