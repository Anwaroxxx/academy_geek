import { User } from 'lucide-react';
import { Link } from '@inertiajs/react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import{ Button } from '../../../components/ui/button';

const Filter = ({
    onCoachChange,
    onPromoChange,
    onFieldChange,
    promos,
    Specialty,
    coaches,
    isAdmin,
}) => {
    return (
        <>
            <div className="flex gap-10 border p-4 font-bold">
                <Select onValueChange={(e) => onPromoChange(e)}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select Promo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>promo</SelectLabel>
                            {promos?.map((e, i) => {
                                return (
                                    <SelectItem
                                        key={e}
                                        value={e === 0 ? 'all' : String(e)}
                                    >
                                        {e === 0 ? 'all' : e}
                                    </SelectItem>
                                );
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select onValueChange={(e) => onFieldChange(e)}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Specialty</SelectLabel>

                            {Specialty?.map((e, i) => {
                                return <SelectItem key={e} value={e}>{e}</SelectItem>;
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select onValueChange={(e) => onCoachChange(e)}>
                    <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select Coach" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Coach</SelectLabel>

                            {coaches?.map((e, i) => {
                                return <SelectItem key={e} value={e}>{e}</SelectItem>;
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {isAdmin === true ? (
                    <Button className="">
                        <Link href="/getclass">refresh</Link>
                    </Button>
                ) : null}

                {}
            </div>
        </>
    );
};

export default Filter;
