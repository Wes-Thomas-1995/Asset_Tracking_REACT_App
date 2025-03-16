import React from 'react';

function AllocationCarousel({ allocationTableData }) {
  return (
    <div className="carousel carousel-center bg-base-100 rounded-box space-x-4 p-4 w-full">
      {allocationTableData.map((data, index) => (
        <div key={index} className="carousel-item w-60">
          <div className="card bg-white shadow-md rounded-lg p-4">
            <h2 className="card-title text-lg text-black font-bold">{data.ALGO}</h2>
            <div className="mt-2">
              <p className="text-sm text-black">
                <strong>Commitment:</strong> ${data.COMMITMENT_BALANCE.toFixed(2)}
              </p>
              <p className="text-sm text-black">
                <strong>Balance:</strong> ${data.PORTFOLIO_BALANCE.toFixed(2)}
              </p>
              <p className="text-sm text-black">
                <strong>Gain:</strong> ${data.GAIN_AMT.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllocationCarousel;