import type { LabelColor } from '../components/label';

export type GetStatusType = 'active' | 'reserved' | 'concretized' | 'concretized_fulfill' | 'refund' | 'internal_admin' | 'money_movement' | 'return' | 'regular' | 'change' | 'featured' | 'yes' | 'no' |'inactive' | 'concreted' | 'created' | 'pending' | 'banned' | 'approved' | 'finished' | 'blocked' | 'unassigned' | 'billed' | 'started' | 'notBilled' | 'discounted' | 'notDiscounted' | 'paid' | 'rejected' | 'expired' | 'expiredWithoutMail' | 'deleted' | 'canceled' | 'pendingDocuments' | 'pendingPay' | 'reviewing' | 'sent' | 'completed' | 'draft';

export type GetStatusReturnType = {
  color: string;
  backgroundColor: string;
  name: string;
  variant: LabelColor
}

export const getStatus = (status: GetStatusType): GetStatusReturnType => {
  switch (status) {
    case 'approved':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Aprobado",
        variant: "success"
      };
    case 'regular':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Regular",
        variant: "success"
      };
    case 'yes':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Si",
        variant: "success"
      };
    case 'finished':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Finalizado",
        variant: "success"
      };
    case 'active':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Activo",
        variant: "success"
      };
    case 'blocked':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Bloqueado",
        variant: "error"
      };
    case 'reserved':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Reservado",
        variant: "error"
      };
    case 'no':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "No",
        variant: "error"
      };
    case 'unassigned':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "No asignado",
        variant: "default"
      };
    case 'billed':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Facturado",
        variant: "success"
      };
    case 'started':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "En curso",
        variant: "info"
      };
    case 'notBilled':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Sin Facturar",
        variant: "warning"
      };
    case 'concretized':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Concretado",
        variant: "info"
      };
    case 'concretized_fulfill':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Concretado calculado",
        variant: "success"
      };
    case 'discounted':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Descontado",
        variant: "success"
      };
    case 'notDiscounted':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Sin Descontar",
        variant: "warning"
      };
    case 'paid':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Pagado",
        variant: "success"
      };
    case 'change':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Cambio",
        variant: "info"
      };
    case 'return':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Devolución",
        variant: "warning"
      };
    case 'internal_admin':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Administración Interna",
        variant: "secondary"
      };
    case 'money_movement':
      return {
        color: '#7C3AED',
        backgroundColor: '#F3E8FF',
        name: "Traslado de dinero",
        variant: "primary"
      };
    case 'rejected':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Rechazado",
        variant: "error"
      };
    case 'expired':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Vencido",
        variant: "error"
      };
    case 'expiredWithoutMail':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Vencido hace dias",
        variant: "error"
      };
    case 'deleted':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Eliminado",
        variant: "error"
      };
    case 'canceled':
      return {
        color: '#E90532',
        backgroundColor: '#FFE3E0',
        name: "Anulado",
        variant: "error"
      };
    case 'pending':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Pendiente",
        variant: "warning"
      };
    case 'pendingDocuments':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Pendiente Documentos",
        variant: "warning"
      };
    case 'featured':
      return {
        color: '#B76E00',
        backgroundColor: '#FFF1D6',
        name: "Destacado",
        variant: "warning"
      };
    case 'reviewing':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "En revisión",
        variant: "info"
      };
    case 'concreted':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "Concretado",
        variant: "info"
      };
    case 'sent':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "Enviado",
        variant: "info"
      };
    // case 'started':
    //   return {
    //     color: '#006C9C',
    //     backgroundColor: '#F4FCFE',
    //     name: "Enviado",
    //     variant: "info"
    //   };
    case 'completed':
      return {
        color: '#229A16',
        backgroundColor: '#E4F8DD',
        name: "Completado",
        variant: "success"
      };
    case 'inactive':
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: "Inactivo",
        variant: "default"
      };
    case 'created':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "Creado",
        variant: "info"
      };
    case 'draft':
      return {
        color: '#006C9C',
        backgroundColor: '#F4FCFE',
        name: "Borrador",
        variant: "default"
      };
    default:
      return {
        color: '#206373',
        backgroundColor: '#F4FCFE',
        name: status,
        variant: "default"
      };
  }
}
