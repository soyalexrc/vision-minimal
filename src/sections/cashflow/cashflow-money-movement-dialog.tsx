/*
Example usage:

import { useState } from 'react';
import { CashflowMoneyMovementDialog } from './cashflow-money-movement-dialog';

function MyComponent() {
  const [openDialog, setOpenDialog] = useState(false);

  const handleSuccess = () => {
    // Refresh your data here
    console.log('Money movement created successfully!');
  };

  return (
    <>
      <Button onClick={() => setOpenDialog(true)}>
        Crear Movimiento
      </Button>
      
      <CashflowMoneyMovementDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
*/

import { useMemo, useState } from 'react';

import { toast } from 'sonner';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { CashflowMoneyMovementForm, type MoneyMovementSchemaType } from './form/cashflow-money-movement.form';
import { CashFlowSchemaType } from './form/create-cashflow-form';
import { useAuthContext } from 'src/auth/hooks';
import { parseCurrency } from 'src/utils/format-number';
import { AxiosResponse } from 'axios';
import { createCashFlow } from 'src/actions/cashflow';

interface CashflowMoneyMovementDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CashflowMoneyMovementDialog({ 
  open, 
  onClose, 
  onSuccess 
}: CashflowMoneyMovementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

    const shortUser = useMemo(() => ({
      id: user?.id,
      username: user?.username,
      name: user?.firstname + ' ' + user?.lastname,
      email: user?.email,
    }), [user?.id, user?.username, user?.firstname, user?.lastname, user?.email]);
  

  const handleSubmit = async (data: MoneyMovementSchemaType) => {

    if (data.from === 0 || data.to === 0) {
      toast.error('Debe seleccionar una entidad de origen y destino');
      return;
    }   
    if (data.currency === 0) {
        toast.error('Debe seleccionar una moneda');
        return;
    }
    if (data.wayToPay === 0) {
        toast.error('Debe seleccionar una forma de pago');
        return;
    }
    if (data.amount <= 0) {
        toast.error('El monto debe ser mayor a 0');
        return;
    }

    const payload: CashFlowSchemaType = {
        date: data.date,
        client: 0,
        user: user.id,
        isTemporalTransaction: false,
        id: undefined,
        person: 17, // MARIA GONZALEZ
        month: '',
        location: 'NAGUNAGUA',
        attachments: [],
        type: 'money_movement',
        temporalTransactionId: 0,
        owner: 0,
        property: 16, //OFICINA VISION
        payments: [
            {
                id: 0,
                amount: parseCurrency(data.amount),
                canon: false,
                contract: false,
                currency: data.currency,
                entity: data.from,
                guarantee: false,
                incomeByThird: 0,
                observation: '',
                pendingToCollect: 0,
                reason: data.reason,
                service: 'Traslado de dinero EGRESO',
                serviceType: '',
                taxPayer: '',
                totalDue: 0,
                transactionType: 3, // EGRESO
                wayToPay: data.wayToPay,
            },
            {
                id: 0,
                amount: parseCurrency(data.amount),
                canon: false,
                contract: false,
                currency: data.currency,
                entity: data.to,
                guarantee: false,
                incomeByThird: 0,
                observation: '',
                pendingToCollect: 0,
                reason: data.reason,
                service: 'Traslado de dinero INGRESO',
                serviceType: '',
                taxPayer: '',
                totalDue: 0,
                transactionType: 1, // INGRESO
                wayToPay: data.wayToPay,
            },

        ]
    }


    setIsSubmitting(true);

    const promise = await (async () => {
            const response: AxiosResponse<any> = await createCashFlow(payload, shortUser);
    
            if (response.status === 200 || response.status === 201) {
            return response.data?.message;
            } else {
            throw new Error(response.data?.message);
            }
        })();
      // Simulate API call - replace with your actual API call
      await toast.promise(promise,
        {
          loading: 'Creando movimiento...',
          success: 'Movimiento creado exitosamente!',
          error: 'Error al crear el movimiento',
        }
      );
    
    try {
      await promise;
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error creating money movement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <IconButton
          onClick={handleCancel}
          disabled={isSubmitting}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <CashflowMoneyMovementForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}