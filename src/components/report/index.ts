// src/components/report/index.ts
// Barrel export para componentes de relatorios - PEERS CodeAI

export { EpicosReport } from './EpicosReport'
export { FeaturesReport } from './FeaturesReport'
export { CronogramaReport } from './CronogramaReport'
export { PremissasRiscosReport } from './PremissasRiscosReport'
export { ReportHeader, ReportHeaderWithLogo } from './ReportHeader'
export { ReportStats, StatCard, STAT_COLORS } from './ReportStats'
export { ExportButton, ExportButtonsGroup, DownloadIconButton, exportToCSV, exportToImage } from './ExportButtons'

export type {
  Epico,
  EpicosReportData,
  Feature,
  FeaturesReportData,
  CronogramaEpico,
  CronogramaStep,
  CronogramaReportData,
  Premissa,
  Risco,
  PremissasRiscosReportData,
  ReportType,
  ReportExportOptions,
} from '@/types/reports'