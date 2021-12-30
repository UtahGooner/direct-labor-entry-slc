import React, {Component, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch, useSelector} from 'react-redux';
import numeral from "numeral";
import {isOutOfLimits, isRateTooHigh, isRateTooLow, rate} from '../../constants/hurricane-entries';
import {addPageSetAction, ProgressBar, selectPagedData, tableAddedAction, SortableTable, Alert} from "chums-ducks";
import {selectCurrentEntry, selectEmployeeEntryList, selectHurricaneEmployee, selectLoading} from "./selectors";
import {BasicEntry, Entry, EntryTableField} from "../common-types";
import {selectEntryAction} from "./actions";

const entryTableFields:EntryTableField[] = [
    {field: 'WorkCenter', title: 'W/C', sortable: true},
    {field: 'StepCode', title: 'Operation', sortable: true},
    {field: 'Description', title: 'Description', className: 'dle--entry-description', sortable: true},
    {field: 'DocumentNo', title: 'WO/IT #', sortable: true},
    {field: 'Minutes', title: 'Minutes', render: ({Minutes}) => numeral(Minutes).format('0,0'), className: 'right', sortable: true},
    {field: 'Quantity', title: 'Quantity', render: ({Quantity}) => numeral(Quantity).format('0,0'), className: 'right', sortable: true},
    // {field: 'AllowedMinutes', title: 'Allowed Minutes', render: (entry:Entry) => numeral(entry.AllowedMinutes).format('0,0'), className: 'right'},
    {field: 'AllowedMinutes', title: 'Rate', render: (entry:Entry) => numeral(rate(entry)).format('0.0000'), className: 'right', sortable: true},
    {field: 'UPH', title: 'UPH', render: ({UPH}) => numeral(UPH).format('0,0'), className: 'right', sortable: true},
    {
        field: 'StandardAllowedMinutes',
        title: "SAM",
        render: ({StandardAllowedMinutes}) => numeral(StandardAllowedMinutes).format('0.0000'),
        className: 'right border-left',
        sortable: true
    },
    {field: 'StdUPH', title: 'Std UPH', render: ({StdUPH}) => numeral(StdUPH).format('0,0'), className: 'right', sortable: true},
    {
        field: 'AllowedMinutes',
        title: 'Rate %',
        render: (row) => numeral(row.StdUPH ? row.UPH / row.StdUPH : 1).format('0.0%'),
        className: 'right border-left',
        sortable: true
    },
];

const rowClassName = (entry:Entry) => {
    return {
        'text-danger': isOutOfLimits(entry),
        'text-warning': isRateTooHigh(entry) || isRateTooLow(entry),
        'text-success': !!entry.StandardAllowedMinutes && !isRateTooHigh(entry) && !isRateTooLow(entry),
    }
};

const tableId = 'hurricane-employee-entries';
const HurricaneEmployeeEntries:React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(tableAddedAction({key: tableId, field: 'LineNo', ascending: true}));
        dispatch(addPageSetAction({key: tableId}));
    }, [])
    const employee = useSelector(selectHurricaneEmployee);
    const loading = useSelector(selectLoading);
    const entries = useSelector(selectEmployeeEntryList);
    const pagedList = useSelector(selectPagedData(tableId, entries));
    const selectedEntry = useSelector(selectCurrentEntry);

    const onSelectEntry = (entry:Entry) => dispatch(selectEntryAction(entry));

    const footerData = entries.reduce((pv, cv) => ({
        Minutes: pv.Minutes + cv.Minutes,
        Quantity: pv.Quantity + cv.Quantity,
        AllowedMinutes: pv.AllowedMinutes + cv.AllowedMinutes,
        ratePct: 0
    }), {Minutes: 0, Quantity: 0, AllowedMinutes: 0, ratePct: 0})

    footerData.ratePct = footerData.Minutes ? footerData.AllowedMinutes / footerData.Minutes : 0;

    if (!employee) {
        return (<Alert>Select Employee</Alert>)
    }

    const tfoot = (
        <tfoot>
        <tr>
            <th colSpan={4}>Total</th>
            <td className="text-end">{numeral(footerData.Minutes).format('0,0')}</td>
            <td className="text-end">{numeral(footerData.Quantity).format('0,0')}</td>
            <td colSpan={4}>&nbsp;</td>
            <td className="text-end">{numeral(footerData.ratePct).format('0,0.0%')}</td>
        </tr>
        </tfoot>
    )

    return (
        <div>
            <h3>Employee Entries - {employee.FullName || 'Select Employee'}</h3>
            <div className="table-responsive">
                {loading && <ProgressBar striped={true} animated={true}/>}
                <SortableTable tableKey={tableId} fields={entryTableFields} data={pagedList}
                               size="sm"
                               keyField="id"
                               selected={selectedEntry.id}
                               onSelectRow={onSelectEntry}
                               rowClassName={rowClassName} tfoot={tfoot} />
            </div>
        </div>
    );
}

export default HurricaneEmployeeEntries;
