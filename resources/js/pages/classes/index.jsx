import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Banner from '@/components/ui/banner';
import { TransText } from '@/components/TransText';
import AppLayout from '@/layouts/app-layout';
import illustration from '../../../../public/assets/images/banner/Lesson-bro.png';
import Cards from './components/cards';
import Filter from './components/filter';

const Classes = ({ items, coaches, isAdmin }) => {
    const [field, setField] = useState('all');
    const [data, setData] = useState(items);

    const promos = [0, 1, 2, 3, 4, 5];
    const specialty = ['all', 'coding', 'media'];
    const [promo, setPromo] = useState('all');
    const [coach, setCoach] = useState('all');

    useEffect(() => {
        let filtered = items ?? [];

        if (promo !== 'all') {
            filtered = filtered.filter(
                (c) => String(c.promo) === String(promo),
            );
        }
        if (field !== 'all') {
            filtered = filtered.filter(
                (c) =>
                    String(c.type ?? '')
                        .trim()
                        .toLowerCase() === field,
            );
        }
        if (coach !== 'all') {
            filtered = filtered.filter((c) => c.coach === coach);
        }
        setData(filtered);
    }, [promo, field, coach, items]);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Classes',
                },
            ]}
        >
            <Head title="Classes" />
            <div className="min-h-screen p-4 md:p-6">
                <Banner
                    illustration={illustration}
                    size={400}
                    title="Classes"
                    description="A place to show all available classes and manage enrollment."
                />
                <Filter
                    onPromoChange={setPromo}
                    onFieldChange={setField}
                    onCoachChange={setCoach}
                    coaches={['all', ...coaches]}
                    promos={promos}
                    isAdmin={isAdmin}
                    Specialty={specialty}
                ></Filter>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {data.map((e, i) => {
                        return (
                            <Link href={'classes/' +  e.id} to="class data">
                                <Cards
                                    key={e.id}
                                    classNum={e.class}
                                    formation={e.type ? e.type : 'class'}
                                    promo={e.promo ? e.promo : '?'}
                                    coach={e.coach ? e.coach : '?'}
                                    studentsNum={
                                        e.student_num ? e.student_num : '?'
                                    }
                                ></Cards>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
};

export default Classes;
