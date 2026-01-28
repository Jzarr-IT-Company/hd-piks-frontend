import React from 'react';
import { Dropdown, Space } from 'antd';
import DeleteObject from '../DeleteObject/DeleteObject';
import EditObject from '../EditObject/EditObject';
const items =(id,refresh)=> [
    {
        key: '1',
        label: (
           <EditObject/>
        ),
    },
    {
        key: '2',
        label: (
            <DeleteObject id={id}refresh={refresh} />
        )
    } 
];

function EditImagesCompo({item,refresh}) {
    return (
        <>
            <div className="overlay-content d-flex justify-content-end align-items-end px-2 pb-3">
                <Dropdown
                    menu={{
                        items:items(item,refresh),
                    }}
                    className="btn btn-light"
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </Space>
                    </a>
                </Dropdown>
            </div>
        </>
    )
}

export default EditImagesCompo