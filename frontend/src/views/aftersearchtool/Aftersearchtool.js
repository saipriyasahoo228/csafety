


import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import {  Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from "src/api";
import { format } from 'date-fns';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'slno', numeric: false, disablePadding: true, label: 'SL NO.' },
  { id: 'issuance_id', numeric: false, disablePadding: true, label: 'Ref NO.' },
  { id: 'toollist', numeric: true, disablePadding: false, label: 'TOOL LIST' },
  { id: 'issuedate', numeric: true, disablePadding: false, label: 'ISSUED DATE' },
  { id: 'nextissue', numeric: true, disablePadding: false, label: 'NEXT ISSUANCE' },
  { id: 'newIssuance_image', numeric: true, disablePadding: false, label: 'IMAGE' },
  { id: 'description', numeric: true, disablePadding: false, label: 'DESCRIPTION' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? '7' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, onPdfDownload } = props;

  return (
    <Toolbar>

        <Typography sx={{ flex: '1 1 100%', textAlign: 'center' }} variant="h6" id="tableTitle" component="div">
          TOOL
        </Typography>


      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>

          <>
            <Tooltip title="Download PDF">
              <IconButton onClick={onPdfDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>

          </>

      </Box>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onPdfDownload: PropTypes.func.isRequired,
};

export default function Aftersearchdress(props) {
  const employee_id=props.employee_id;
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('slno');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/item/issued/?filter=Tool&employeeId=${employee_id}`);
        console.log(response.data);

        // Flatten the items array to create individual rows for each PPE item
        const itemsData = response.data.data.flatMap((employee, index) =>
          employee.items.map((item, itemIndex) => {
            // Format the date to "dd MMM yy"
            // const formattedDate = format(new Date(item.issue_date), 'dd MMM yy');

            return {
              id: `${index}-${itemIndex}`,
              slno: itemIndex + 1,  // Sequential numbering
              issuance_id: item.issuance_id,
              toollist: item.item_name,

              issuedate:item.issue_date? format(new Date(item.issue_date), 'dd/MM/yyyy') : 'N/A',
              nextissue:item.expiry_date? format(new Date(item.expiry_date), 'dd/MM/yyyy') : 'N/A', // Formatted date using date-fns // Formatted expiry date using date-fns
              newIssuance_image: item.newIssuance_image,
              about_the_newissuance: item.about_the_newissuance,
            };
          })
        );

        setRows(itemsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedImage('');
  };
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(() => {
    return stableSort(rows, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [order, orderBy, page, rows, rowsPerPage]);

  // const handlePdfDownload = () => {
  //   const doc = new jsPDF();
  //   doc.autoTable({
  //     head: [['SL NO.', 'REF NO.','TOOL LIST', 'ISSUED DATE', 'NEXT ISSUANCE','DESCRIPTION']],
  //     body: rows.map((row) => [row.slno,row.issuance_id, row.toollist, row.issuedate, row.nextissue,row.about_the_newissuance,
  //     ]),
  //   });
  //   doc.save('TOOL-report.pdf');
  // };



  // const handlePdfDownload = () => {
  //   const doc = new jsPDF({ orientation: "landscape" }); // Landscape mode for more space

  //   // Table Headers (Ensuring Proper Spacing)
  //   const headers = [['SL NO.', 'REF NO.', 'TOOL LIST', 'ISSUED DATE', 'NEXT ISSUANCE', 'DESCRIPTION', 'IMAGE']];

  //   // Table Body
  //   const body = rows.map(row => [
  //     row.slno,
  //     row.issuance_id,
  //     row.toollist,
  //     row.issuedate,
  //     row.nextissue,
  //     row.about_the_newissuance,
  //     '' // Placeholder for image column
  //   ]);

  //   // Generate AutoTable with Increased Row Height & Proper Header Alignment
  //   doc.autoTable({
  //     head: headers,
  //     body: body,
  //     startY: 20,
  //     theme: "grid",
  //     styles: {
  //       fontSize: 10,
  //       cellPadding: 8, // Increased padding for larger row height
  //       valign: "middle",
  //       halign: "center",
  //     },
  //     headStyles: {
  //       fillColor: [0, 102, 204],
  //       textColor: [255, 255, 255],

  //       halign: "center", // Ensures headers are aligned properly
  //       fontSize: 10, // Slightly larger font for better visibility
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 25 }, // SL NO.
  //       1: { cellWidth: 30 }, // REF NO.
  //       2: { cellWidth: 45 }, // TOOL LIST
  //       3: { cellWidth: 35 }, // ISSUED DATE
  //       4: { cellWidth: 35 }, // NEXT ISSUANCE
  //       5: { cellWidth: 60 }, // DESCRIPTION
  //       6: { cellWidth: 45 }, // IMAGE Column
  //     },
  //     didParseCell: (data) => {
  //       if (data.section === "body") {
  //         data.cell.styles.minCellHeight = 15; // Increase row height
  //       }
  //     },
  //     didDrawCell: (data) => {
  //       if (data.column.index === 6 && rows[data.row.index].newIssuance_image) {
  //         const imgData = `data:image/png;base64,${rows[data.row.index].newIssuance_image}`;

  //         // Fit the image properly inside the cell
  //         const cellWidth = data.cell.width;
  //         const cellHeight = data.cell.height;
  //         doc.addImage(imgData, 'PNG', data.cell.x + 2, data.cell.y + 2, cellWidth - 4, cellHeight - 4);
  //       }
  //     }
  //   });

  //   // Save the PDF
  //   doc.save("TOOL-report.pdf");


  const handlePdfDownload = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Table Headers with Proper Spacing
    const headers = [['SERIAL NO.', 'REF NO.', 'TOOL LIST', 'ISSUED DATE', 'NEXT ISSUANCE', 'DESCRIPTION', 'IMAGE']];

    // Table Body
    const body = rows.map(row => [
      row.slno || "N/A",
      row.issuance_id || "N/A",
      row.toollist || "N/A",
      row.issuedate || "N/A",
      row.nextissue || "N/A",
      row.about_the_newissuance || "N/A",
      '' // Image placeholder
    ]);

    // Generate AutoTable with Adjusted Row Heights
    doc.autoTable({
      head: headers,
      body: body,
      startY: 20,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 10, // More padding for larger row height
        valign: "middle",
        halign: "center",
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        halign: "center",
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // SERIAL NO.
        1: { cellWidth: 30 }, // REF NO.
        2: { cellWidth: 50 }, // TOOL LIST
        3: { cellWidth: 40 }, // ISSUED DATE
        4: { cellWidth: 40 }, // NEXT ISSUANCE
        5: { cellWidth: 70 }, // DESCRIPTION
        6: { cellWidth: 50 }, // IMAGE
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          data.cell.styles.minCellHeight = 25; // Increase row height for better readability
        }
      },
      didDrawCell: (data) => {
        if (data.column.index === 6) {
          const rowData = rows[data.row.index];

          if (rowData && rowData.newIssuance_image) {
            const imgData = `data:image/png;base64,${rowData.newIssuance_image}`;

            // Fit the image properly inside the cell
            const imgWidth = data.cell.width - 6; // Fit within the cell
            const imgHeight = data.cell.height - 6;
            const xPos = data.cell.x + 3;
            const yPos = data.cell.y + 3;

            doc.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
          }
        }
      }
    });

    // Save the PDF
    doc.save("TOOL-report.pdf");


  };
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} onPdfDownload={handlePdfDownload} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    <TableCell component="th" id={labelId} scope="row" padding="7">
                      {row.slno}
                    </TableCell>
                    <TableCell align="left">{row.issuance_id}</TableCell>
                    <TableCell align="right">{row.toollist}</TableCell>
                    <TableCell align="right">{row.issuedate}</TableCell>
                    <TableCell align="right">{row.nextissue}</TableCell>

                    <TableCell align="right">
                        <img
                          src={`data:image/png;base64,${row.newIssuance_image}`}
                           alt="Image Not Found "
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageClick(`data:image/png;base64,${row.newIssuance_image}`)}
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            // e.target.src = 'https://via.placeholder.com/80'; // Fallback image
                          }}
                />
              </TableCell>
              <TableCell align="right">{row.about_the_newissuance}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Preview"
            style={{ width: '400px', height: '300px', objectFit: 'cover' }}
          />
        </DialogContent>
        <DialogActions>
          <button onClick={handleDialogClose} style={{ padding: '10px' }}>Close</button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}






