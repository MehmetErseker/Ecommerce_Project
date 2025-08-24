using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class AddressManager : IAddressService
    {
        private readonly IAddressDal _addressDal;
        private readonly IMapper _mapper;

        public AddressManager(IAddressDal addressDal, IMapper mapper)
        {
            _addressDal = addressDal;
            _mapper = mapper;
        }

        public async Task<IResult> Add(AddressDto addressDto)
        {
            var addressEntity = _mapper.Map<Address>(addressDto);
            await _addressDal.Add(addressEntity);
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

        public async Task<IDataResult<List<AddressDto>>> GetAll()
        {
            var AddressEntity = await _addressDal.GetAll();
            var AddressDto = _mapper.Map<List<AddressDto>>(AddressEntity);
            return new SuccessDataResult<List<AddressDto>>(AddressDto, Messages.AddressesListed);

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
