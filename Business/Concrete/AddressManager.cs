using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class AddressManager : IAddressService
    {
        private readonly IAddressDal _addressDal;

        public AddressManager(IAddressDal addressDal)
        {
            _addressDal = addressDal;
        }

        public async Task<IResult> Add(Address address)
        {
            await _addressDal.Add(address);
            return new SuccessResult(Messages.AddressAdded);
        }

        public async Task<IResult> Delete(int addressId)
        {
            var entity = await _addressDal.Get(p => p.Id == addressId);
            if (entity == null)
            {
                return new ErrorResult(Messages.AddressNotFound);
            }

            await _addressDal.Delete(entity);
            return new SuccessResult(Messages.AddressDeleted);
        }

        public async Task<IDataResult<List<Address>>> GetAll()
        {
            var data = await _addressDal.GetAll();
            return new SuccessDataResult<List<Address>>(data, Messages.AddressesListed);
        }

        public async Task<IResult> Update(Address address)
        {
            await _addressDal.Update(address);
            return new SuccessResult(Messages.AddressUpdated);
        }

        public async Task<IDataResult<Address>> GetById(int addressId)
        {
            var data = await _addressDal.Get(p => p.Id == addressId);
            return new SuccessDataResult<Address>(data);
        }
    }
}
