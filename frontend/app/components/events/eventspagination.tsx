import * as React from 'react';
import { TablePagination } from '@mui/material';
import { useSearchParams } from 'react-router';

function noop(): void {
  return undefined;
}

interface OrdersPaginationProps {
  count: number;
}

export function OrdersPagination({ count }: OrdersPaginationProps): React.JSX.Element {
  const [params, setParams] = useSearchParams();
  const rowsPerPage = parseInt(params.get('rowsPerPage') ?? '25');
  const page = parseInt(params.get('page') ?? '0');

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, page: number): void => {
    if (page === 0) {
      params.delete('page');
      setParams(params);
      return;
    }
    setParams({ page: page.toString() });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    const rowsPerPage = parseInt(event.target.value, 10);
    if (rowsPerPage === 25) {
      params.delete('rowsPerPage');
      setParams(params);
      return;
    }
    params.set('rowsPerPage', rowsPerPage.toString());
    setParams(params);
  };

  return (
    <TablePagination
      component="div"
      count={count}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[25, 100, 250, 500, 1000]}
    />
  );
}
