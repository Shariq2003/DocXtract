import React, { useState } from 'react';
import { Button, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, createTheme, Select, MenuItem } from '@mui/material';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [links, setLinks] = useState([]);
    const [selectedStates, setSelectedStates] = useState({});

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const extractLinks = async () => {
        if (!file) {
            alert('Please select a file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const contents = e.target.result;
            const text = contents.replace(/(?:\r\n|\r|\n)/g, ' ');
            const regex = /https?:\/\/[^\s)]+/g;
            const extractedLinks = text.match(regex) || [];
            setLinks(extractedLinks.map(link => ({ url: link, completionState: 'Pending' })));
        };
        reader.readAsText(file);
    };

    const downloadExcelFile = () => {
        if (!file) {
            alert('Please select a file.');
            return;
        }
        const data = links.map(link => ({ Link: link.url, 'Completion State': link.completionState }));
        const newData = XLSX.utils.json_to_sheet(data);

        // Add data validation for each cell in the 'Completion State' column
        const completionStateOptions = ['Pending', 'Revisit', 'Done'];
        data.forEach((_, index) => {
            const cellAddress = `B${index + 2}`; // Assuming the data starts from B2
            newData[cellAddress].l = {
                Target: '',
                Tooltip: '',
                text: completionStateOptions.join(',')
            };
        });

        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newData, 'Links');
        const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(fileData, 'links.xlsx');
    };

    const handleCompletionStateChange = (e, index) => {
        const { value } = e.target;
        const updatedLinks = [...links];
        updatedLinks[index].completionState = value;
        setLinks(updatedLinks);
    };


    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            secondary: {
                main: '#ffcc80',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Container style={{ marginTop: "35px", marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h3" style={{ marginBottom: '20px', color: "white" }}>DocXtract</Typography>
                <Paper style={{ padding: '20px', width: "1000px" }}>
                    <Typography variant="h5" style={{ marginBottom: '10px' }}>Upload PDF</Typography>
                    <input type="file" onChange={handleFileChange} />
                    <Button variant="contained" onClick={extractLinks} style={{ marginLeft: '10px' }}>Extract Links</Button>
                    <Button variant="contained" onClick={downloadExcelFile} style={{ marginLeft: '10px' }}>Download Excel File</Button>
                    <TableContainer style={{ margin: "15px" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{width:"75px"}}>SR. No.</TableCell>
                                    <TableCell>Link</TableCell>
                                    <TableCell>Completion State</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {links.map((link, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell><a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>{link.url}</a></TableCell>
                                        <TableCell>
                                            <Select
                                                value={selectedStates[index] || link.completionState}
                                                onChange={(e) => {
                                                    const newState = e.target.value;
                                                    setSelectedStates({ ...selectedStates, [index]: newState });
                                                }}
                                                style={{
                                                    backgroundColor: selectedStates[index] === 'Pending' ? 'red' :
                                                        selectedStates[index] === 'Done' ? 'green' :
                                                            selectedStates[index] === 'Revisit' ? 'blue' : 'red',
                                                    width: "150px"
                                                }}
                                            >
                                                <MenuItem value="Pending" style={{ color: 'red' }}>Pending</MenuItem>
                                                <MenuItem value="Revisit" style={{ color: 'blue' }}>Revisit</MenuItem>
                                                <MenuItem value="Done" style={{ color: 'green' }}>Done</MenuItem>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </ThemeProvider>
    );
}

export default FileUpload;
